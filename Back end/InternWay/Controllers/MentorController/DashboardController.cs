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
    public class DashboardController : ControllerBase
    {
        private readonly InternShipWayDB _context;

        public DashboardController(InternShipWayDB context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (UserId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            if (!int.TryParse(UserId, out var id))
                return Unauthorized(new { message = "Unauthorized access" });

            var today = DateOnly.FromDateTime(DateTime.Now);
            var currentMonth = DateTime.Now.Month;
            var currentYear = DateTime.Now.Year;

            // Fetch Mentor to get Average Rating
            var mentor = await _context.Mentors.FirstOrDefaultAsync(m => m.user_id == id);
            if (mentor == null)
            {
                return NotFound(new { message = "Mentor not found" });
            }

            // Fetch all sessions related to this mentor
            var mentorSessions = await _context.mentorship_Sessions
                .Include(s => s.mentor_availability)
                .Include(s => s.student)
                    .ThenInclude(st => st.User)
                .Where(s => s.mentor_availability.mentor_id == mentor.Mentor_Id)
                .ToListAsync();

            // 1. Total Sessions (Count of Confirmed and Completed sessions only)
            int totalSessions = mentorSessions.Count(s => 
                s.status_session == Mentorship_Session.Status_Session.Completed || 
                s.status_session == Mentorship_Session.Status_Session.Confirmed);

            // 2. Active Mentees (Distinct students in Confirmed and Completed sessions)
            int activeMentees = mentorSessions
                .Where(s => 
                    s.status_session == Mentorship_Session.Status_Session.Completed || 
                    s.status_session == Mentorship_Session.Status_Session.Confirmed)
                .Select(s => s.student_id)
                .Distinct()
                .Count();

            // 3. Hours This Month (Completed sessions in current month)
            double hoursThisMonth = mentorSessions
                .Where(s => s.status_session == Mentorship_Session.Status_Session.Completed &&
                            s.mentor_availability.date.Month == currentMonth &&
                            s.mentor_availability.date.Year == currentYear)
                .Sum(s => (s.mentor_availability.Duration).TotalHours);

            // 4. Upcoming Sessions
            var upcomingSessions = mentorSessions
                .Where(s => s.mentor_availability.date >= today &&
                            s.status_session == Mentorship_Session.Status_Session.Confirmed)
                .OrderBy(s => s.mentor_availability.date)
                .ThenBy(s => s.mentor_availability.start_time)
                .Take(3) // Match UI (shows top 3)
                .Select(s => new UpcomingSessionDto
                {
                    SessionId = s.session_id,
                    StudentId = s.student_id,
                    StudentName = s.student.User.Full_Name,
                    Topic = s.topic.ToString().Replace("_", " "),
                    FormattedDate = GetFormattedDateString(s.mentor_availability.date, s.mentor_availability.start_time),
                    Duration = GetFormattedDuration(s.mentor_availability.Duration),
                    CanStart = DateTime.UtcNow >= DateTime.SpecifyKind(s.mentor_availability.date.ToDateTime(s.mentor_availability.start_time).AddMinutes(-5), DateTimeKind.Utc) &&
                               DateTime.UtcNow <= DateTime.SpecifyKind(s.mentor_availability.date.ToDateTime(s.mentor_availability.start_time).Add(s.mentor_availability.Duration), DateTimeKind.Utc)
                })
                .ToList();

            // 5. Recent Mentees
            var recentMentees = mentorSessions
                .Where(s => s.status_session == Mentorship_Session.Status_Session.Completed)
                .GroupBy(s => new { s.student_id, s.student.User.Full_Name, s.student.Major })
                .Select(g => new RecentMenteeDto
                {
                    StudentId = g.Key.student_id,
                    StudentName = g.Key.Full_Name,
                    Major = g.Key.Major ?? "General",
                    CompletedSessionsText = $"{g.Count()} sessions completed"
                })
                .Take(3) // UI shows top 3
                .ToList();

            // Calculate accurate average rating dynamically
            double rawAverage = await _context.Reviews
                .Where(r => r.MentorId == mentor.Mentor_Id)
                .AverageAsync(r => (double?)r.Rating) ?? 0.0;
            double averageRating = Math.Round(rawAverage, 1);

            var dashboardData = new MentorDashboardDto
            {
                TotalSessions = totalSessions,
                ActiveMentees = activeMentees,
                HoursThisMonth = (int)Math.Round(hoursThisMonth),
                AverageRating = averageRating,
                UpcomingSessions = upcomingSessions,
                RecentMentees = recentMentees
            };

            return Ok(dashboardData);
        }

        private string GetFormattedDateString(DateOnly date, TimeOnly startTime)
        {
            var sessionStartUtc = DateTime.SpecifyKind(date.ToDateTime(startTime), DateTimeKind.Utc);
            var sessionStartLocal = sessionStartUtc.ToLocalTime();
            var localDate = DateOnly.FromDateTime(sessionStartLocal);
            var localTime = TimeOnly.FromDateTime(sessionStartLocal);

            var today = DateOnly.FromDateTime(DateTime.Now);
            var tomorrow = today.AddDays(1);
            var timeString = localTime.ToString("h:mm tt");

            if (localDate == today)
            {
                return $"Today, {timeString}";
            }
            else if (localDate == tomorrow)
            {
                return $"Tomorrow, {timeString}";
            }
            else
            {
                return $"{localDate.ToString("MMM d")}, {timeString}"; // e.g., "Jan 17, 2:00 PM"
            }
        }

        private string GetFormattedDuration(TimeSpan duration)
        {

            if (duration.TotalMinutes == 60)
            {
                return "1 hour";
            }
            else if (duration.TotalHours > 1 && duration.Minutes == 0)
            {
                return $"{duration.TotalHours} hours";
            }
            else
            {
                return $"{duration.TotalMinutes} min";
            }
        }
    }
}