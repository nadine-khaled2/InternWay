using InternWay.DTOs;
using InternWay.DTOs.MentorModels;
using InternWay.Models.mentor_schema;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace InternWay.Controllers.MentorController
{
    [Route("Mentor/[controller]")]
    [ApiController]
    [Authorize(Roles = "mentor")]
    public class MySessionsController : ControllerBase
    {
        private readonly InternShipWayDB _context;
        private readonly InternWay.IServices.INotificationService _notificationService;

        public MySessionsController(InternShipWayDB context, InternWay.IServices.INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSessions()
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (UserId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            if (!int.TryParse(UserId, out var id))
                return Unauthorized(new { message = "Unauthorized access" });

            var mentor = await _context.Mentors.FirstOrDefaultAsync(m => m.user_id == id);
            if (mentor == null) return NotFound(new { message = "Mentor not found" });
            int mentorId = mentor.Mentor_Id;

            var sessions = await _context.mentorship_Sessions
                .Where(s => s.mentor_availability.mentor_id == mentorId)
                .Include(s => s.student).ThenInclude(st => st.User)
                .Include(s => s.mentor_availability)
                .OrderBy(s => s.mentor_availability.date).ThenBy(s => s.mentor_availability.start_time)
                .ToListAsync();

            var today = DateOnly.FromDateTime(DateTime.Now);

            var result = sessions.Select(s => {
                var sessionStartUtc = DateTime.SpecifyKind(s.mentor_availability.date.ToDateTime(s.mentor_availability.start_time), DateTimeKind.Utc);
                var sessionStartLocal = sessionStartUtc.ToLocalTime();
                var localDate = DateOnly.FromDateTime(sessionStartLocal);
                var localTime = TimeOnly.FromDateTime(sessionStartLocal);

                return new MentorSessionListDto
                {
                    SessionId = s.session_id,
                    MenteeId = s.student_id,
                    MenteeName = s.student.User.Full_Name,
                    Topic = s.topic.ToString(),
                    Status = s.status_session.ToString(),
                    FormattedDate = localDate == today ? $"Today, {localTime:hh:mm tt}" : $"{localDate:MMM d}, {localTime:hh:mm tt}",
                    Duration = GetDuration(s.mentor_availability.Duration),
                    IsUpcoming = localDate >= today && s.status_session != Mentorship_Session.Status_Session.Completed,
                    CanStart = DateTime.UtcNow >= sessionStartUtc.AddMinutes(-5) &&
                           DateTime.UtcNow <= DateTime.SpecifyKind(s.mentor_availability.date.ToDateTime(s.mentor_availability.start_time).Add(s.mentor_availability.Duration), DateTimeKind.Utc)
                };
            }).ToList();

            return Ok(result);
        }

        private string GetDuration(TimeSpan span)
        {
            if (span.TotalMinutes < 60) return $"{span.TotalMinutes} min";
            if (span.TotalMinutes == 60) return "1 hour";
            return $"{Math.Round(span.TotalHours, 1)} hours";
        }

        [HttpGet("rescheduleSession")]
        public async Task<IActionResult> GetAvailableSlotsForReschedule()
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (UserId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            if (!int.TryParse(UserId, out var id))
                return Unauthorized(new { message = "Unauthorized access" });

            var mentor = await _context.Mentors.FirstOrDefaultAsync(m => m.user_id == id);
            if (mentor == null) return NotFound(new { message = "Mentor not found" });
            int mentorId = mentor.Mentor_Id;

            var today = DateOnly.FromDateTime(DateTime.Now);
            var dbSlots = await _context.Mentor_Availabilities
                .Where(a => a.mentor_id == mentorId && !a.is_booked && a.date >= today)
                .OrderBy(a => a.date)
                .ThenBy(a => a.start_time)
                .ToListAsync();

            var slots = dbSlots.Select(a => {
                var slotStartUtc = DateTime.SpecifyKind(a.date.ToDateTime(a.start_time), DateTimeKind.Utc);
                var slotStartLocal = slotStartUtc.ToLocalTime();
                var localDate = DateOnly.FromDateTime(slotStartLocal);
                var localTime = TimeOnly.FromDateTime(slotStartLocal);

                return new MentorSlotDto
                {
                    SlotId = a.Slot_Id,
                    Day = localDate.ToString("dddd"), // e.g. "Monday"
                    Date = localDate.ToString("yyyy-MM-dd"), // "2026-06-21"
                    StartTime = localTime.ToString("hh:mm tt"), // e.g. "07:00 AM"
                    EndTime = TimeOnly.FromDateTime(slotStartLocal.Add(a.Duration)).ToString("hh:mm tt"), // e.g. "08:00 AM"
                    SessionType = a.paid_status.ToString(),
                    Price = a.priceSlot,
                    IsBooked = a.is_booked
                };
            }).ToList();

            return Ok(slots);
        }

        [HttpPut("rescheduleSession/{sessionId}/{slotId}")]
        public async Task<IActionResult> selectedOtherSession(int sessionId, int slotId)
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (UserId == null || !int.TryParse(UserId, out var userId)) return Unauthorized(new { message = "Unauthorized access" });
            var mentor = await _context.Mentors.FirstOrDefaultAsync(m => m.user_id == userId);
            if (mentor == null) return NotFound("Mentor not found");

            var session = await _context.mentorship_Sessions
                .Include(s => s.mentor_availability)
                .Include(s => s.student)
                .FirstOrDefaultAsync(s => s.session_id == sessionId);

            if (session == null) return NotFound("Session not found");
            if (session.mentor_availability.mentor_id != mentor.Mentor_Id) return StatusCode(403, "You are not allowed to access this session.");

            if (session.status_session == Mentorship_Session.Status_Session.Cancelled ||
                session.status_session == Mentorship_Session.Status_Session.Completed ||
                session.status_session == Mentorship_Session.Status_Session.Expired)
            {
                return BadRequest("You cannot reschedule a cancelled, completed, or expired session.");
            }

            var originalSessionStart = DateTime.SpecifyKind(session.mentor_availability.date.ToDateTime(session.mentor_availability.start_time), DateTimeKind.Utc);
            if (DateTime.UtcNow > originalSessionStart.AddHours(-1))
            {
                return BadRequest("You cannot reschedule a session less than 1 hour before its start time.");
            }

            var newSlot = await _context.Mentor_Availabilities.FirstOrDefaultAsync(a => a.Slot_Id == slotId);
            if (newSlot == null || newSlot.is_booked) return BadRequest("Selected slot is invalid or already booked");

            // Unbook old slot
            session.mentor_availability.is_booked = false;

            // Book new slot
            session.slot_id = slotId;
            newSlot.is_booked = true;
            // Kept the same status_session so if it was Confirmed, it stays Confirmed.

            await _context.SaveChangesAsync();

              if (session.student != null)
              {
                  var mentorUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                  string mentorName = mentorUser?.Full_Name ?? "Your mentor";
                  string topicName = session.topic.ToString().Replace("_", " ");
                  string message = $"Your {topicName} session with {mentorName} has been rescheduled to a new time.";
                  await _notificationService.CreateAndSendNotificationAsync(
                      userId: session.student.user_id,
                      title: "Session Rescheduled",
                      message: message,
                      type: "StudentSession",
                      relatedEntityId: session.session_id
                  );
              }

            return Ok(new { message = "Session rescheduled successfully" });
        }

        [HttpGet("joinMeeting/{sessionId}")]
        public async Task<IActionResult> StartMeeting(int sessionId)
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (UserId == null || !int.TryParse(UserId, out var mentorId))
                return Unauthorized(new { message = "Unauthorized access" });

            var session = await _context.mentorship_Sessions
                .Include(s => s.mentor_availability)
                .ThenInclude(m => m.Mentor)
                .FirstOrDefaultAsync(s => s.session_id == sessionId);

            if (session == null)
                return NotFound("Session not found");

            var slot = session.mentor_availability;
            if (slot == null || slot.Mentor == null || slot.Mentor.user_id != mentorId)
                return StatusCode(403, "You are not allowed to access this session.");

            if (string.IsNullOrEmpty(slot.session_link))
                return BadRequest("No meeting link provided for this slot");

            if (session.status_session == Mentorship_Session.Status_Session.Completed)
                return BadRequest("This session has already been completed.");

            if (session.status_session != Mentorship_Session.Status_Session.Confirmed
               && session.status_session != Mentorship_Session.Status_Session.Started
               && session.status_session != Mentorship_Session.Status_Session.InProgress)
                return BadRequest("This session is not available for joining.");

            var sessionStart = DateTime.SpecifyKind(slot.date.ToDateTime(slot.start_time), DateTimeKind.Utc);
            var EndSession = sessionStart.Add(slot.Duration);

            if (DateTime.UtcNow < sessionStart.AddMinutes(-5))
                return BadRequest("You can join the session only 5 minutes before it starts.");

            if (DateTime.UtcNow >= EndSession)
                return BadRequest("The session end time has passed. You can no longer join.");

            var alreadyJoined = session.MentorJoinedAt != null;

            if (!alreadyJoined)
                session.MentorJoinedAt = DateTime.UtcNow;

            if (session.StudentJoinedAt != null && session.MentorJoinedAt != null)
                session.status_session = Mentorship_Session.Status_Session.Started;
            else
                session.status_session = Mentorship_Session.Status_Session.InProgress;

            await _context.SaveChangesAsync();

            var EndSessionTime = DateTime.SpecifyKind(EndSession.AddMinutes(1), DateTimeKind.Utc);

            if (!alreadyJoined)
                 Hangfire.BackgroundJob.Schedule<InternWay.IServices.IServicesOfStudent>(e => e.CompleteSession(session.session_id), EndSessionTime);

            if (alreadyJoined)
                return Ok(new { link = slot.session_link, message = "You already joined the session." });

            return Ok(new { link = slot.session_link, message = "Joined successfully. You can start the session now." });
        }

        [HttpDelete("cancelSession/{sessionId}")]
        public async Task<IActionResult> CancelSession(int sessionId)
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (UserId == null || !int.TryParse(UserId, out var userId)) return Unauthorized(new { message = "Unauthorized access" });
            var mentor = await _context.Mentors.FirstOrDefaultAsync(m => m.user_id == userId);
            if (mentor == null) return NotFound("Mentor not found");

            var session = await _context.mentorship_Sessions
                .Include(s => s.mentor_availability)
                .Include(s => s.student)
                .FirstOrDefaultAsync(s => s.session_id == sessionId);

            if (session == null) return NotFound("Session not found");
            if (session.mentor_availability.mentor_id != mentor.Mentor_Id) return StatusCode(403, "You are not allowed to access this session.");

            // Validate that we cannot cancel an Accepted or Completed session
            if (session.status_session == Mentorship_Session.Status_Session.Confirmed ||
                session.status_session == Mentorship_Session.Status_Session.Completed)
            {
                return BadRequest(new { message = "You cannot cancel an accepted or completed session. Please reschedule instead if an emergency occurred." });
            }

            session.mentor_availability.is_booked = false;
            session.status_session = Mentorship_Session.Status_Session.Cancelled;

            await _context.SaveChangesAsync();

              if (session.student != null)
              {
                  var mentorUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                  string mentorName = mentorUser?.Full_Name ?? "Your mentor";
                  string topicName = session.topic.ToString().Replace("_", " ");
                  string message = $"Your {topicName} session with {mentorName} has been cancelled.";
                  await _notificationService.CreateAndSendNotificationAsync(
                      userId: session.student.user_id,
                      title: "Session Cancelled",
                      message: message,
                      type: "StudentSession",
                      relatedEntityId: session.session_id
                  );
              }

            return Ok(new { message = "Session cancelled successfully" });
        }

        [HttpPut("confirmsession/{sessionId}")]
        public async Task<IActionResult> AcceptSession(int sessionId)
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (UserId == null || !int.TryParse(UserId, out var userId)) return Unauthorized(new { message = "Unauthorized access" });
            var mentor = await _context.Mentors.FirstOrDefaultAsync(m => m.user_id == userId);
            if (mentor == null) return NotFound("Mentor not found");

            var session = await _context.mentorship_Sessions.Include(s => s.mentor_availability).Include(s => s.student).FirstOrDefaultAsync(s => s.session_id == sessionId);
            if (session == null) return NotFound("Session not found");
            if (session.mentor_availability == null || session.mentor_availability.mentor_id != mentor.Mentor_Id) return StatusCode(403, "You are not allowed to access this session.");

            session.status_session = Mentorship_Session.Status_Session.Confirmed;
            await _context.SaveChangesAsync();

            var mentorUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            string mentorName = mentorUser?.Full_Name ?? "Your mentor";
            string topicName = session.topic.ToString().Replace("_", " ");
            string message = $"Great news! {mentorName} has confirmed your upcoming {topicName} session.";

            await _notificationService.CreateAndSendNotificationAsync(session.student.user_id, "Session Confirmed", message, "StudentSession", sessionId);

            return Ok(new { message = "Session confirmed successfully" });
        }

        [HttpGet("viewdetails/{sessionId}")]
        public async Task<IActionResult> DetailsOfSession(int sessionId)
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (UserId == null || !int.TryParse(UserId, out var userId)) return Unauthorized(new { message = "Unauthorized access" });
            var mentor = await _context.Mentors.FirstOrDefaultAsync(m => m.user_id == userId);
            if (mentor == null) return NotFound("Mentor not found");

            var session = await _context.mentorship_Sessions
                .Include(s => s.student).ThenInclude(st => st.User)
                .Include(s => s.mentor_availability)
                .FirstOrDefaultAsync(s => s.session_id == sessionId);

            if (session == null) return NotFound("Session not found");
            if (session.mentor_availability.mentor_id != mentor.Mentor_Id) return StatusCode(403, "You are not allowed to access this session.");

            var result = new MentorSessionDetailsDto
            {
                SessionId = session.session_id,
                Student = new StudentObjectDto
                {
                    Id = session.student_id,
                    Name = session.student.User.Full_Name,
                    University = session.student.University,
                    Major = session.student.Major
                },
                Topic = session.topic.ToString(),
                Status = session.status_session.ToString(),
                StartTime = DateTime.SpecifyKind(session.mentor_availability.date.ToDateTime(session.mentor_availability.start_time), DateTimeKind.Utc).ToLocalTime().ToString("yyyy-MM-ddTHH:mm:ss"),
                EndTime = DateTime.SpecifyKind(session.mentor_availability.date.ToDateTime(session.mentor_availability.start_time.Add(session.mentor_availability.Duration)), DateTimeKind.Utc).ToLocalTime().ToString("yyyy-MM-ddTHH:mm:ss"),
                Duration = GetDuration(session.mentor_availability.Duration),
                Notes = null // Populate this if you add a notes field to the session model later
            };

            return Ok(result);
        }
        [HttpGet("viewprofile/{studentId}")]
        public async Task<IActionResult> GetProfile(int studentId)
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (UserId == null || !int.TryParse(UserId, out var userId)) 
                return Unauthorized(new { message = "Unauthorized access" });

            var mentor = await _context.Mentors.FirstOrDefaultAsync(m => m.user_id == userId);
            if (mentor == null) 
                return NotFound(new { message = "Mentor not found" });

            // Check if this student has a session with this mentor
            var hasSession = await _context.mentorship_Sessions
                .AnyAsync(s => s.student_id == studentId && s.mentor_availability.mentor_id == mentor.Mentor_Id);

            if (!hasSession)
                return StatusCode(403, new { message = "You are not allowed to access this student's profile because they do not have any sessions with you." });

            var student = await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Student_Id == studentId);

            if (student == null) return NotFound(new { message = "Student not found" });

            var result = new MenteeProfileDto
            {
                StudentId = student.Student_Id,
                FullName = student.User.Full_Name,
                Email = student.User.Email,
                Phone = student.User.PhoneNumber ?? "",
                University = student.University,
                College = student.College,
                Major = student.Major,
                GraduationYear = student.Graduation_Year,
                Location = student.location
            };

            return Ok(result);
        }
    }
}




