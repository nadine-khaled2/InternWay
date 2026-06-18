using InternWay.DTOs;
using InternWay.DTOs.MentorModels;
using InternWay.Models.company_schema;
using InternWay.Models.mentor_schema;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InternWay.IServices;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using static InternWay.Models.company_schema.Internship;

namespace InternWay.Controllers.MentorController
{
    [Route("Mentor/[controller]")]
    [ApiController]
    [Authorize(Roles = "mentor")]
    public class ProfileController : ControllerBase
    {
        private readonly InternShipWayDB _context;
        private readonly IServicesOfMentor _servicesOfMentor;

        public ProfileController(InternShipWayDB context, IServicesOfMentor servicesOfMentor)
        {
            _context = context;
            _servicesOfMentor = servicesOfMentor;
        }

        [HttpGet]
        public async Task<IActionResult> profileData()
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (UserId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            if (!int.TryParse(UserId, out var id))
                return Unauthorized(new { message = "Unauthorized access" });

            var mentor = await _context.Mentors
                .Include(m => m.User)
                .Include(m => m.mentor_Availabilities)
                .FirstOrDefaultAsync(m => m.user_id == id);

            if (mentor == null) return NotFound(new { message = "Mentor not found" });

            var result = new MentorProfileDto
            {
                MentorId = mentor.Mentor_Id,
                FullName = mentor.User.Full_Name,
                Email = mentor.User.Email,
                PhoneNumber = mentor.User.PhoneNumber ?? "",
                Location = mentor.location,
                JobTitle = mentor.Job_Title,
                YearsExperience = mentor.Years_Experience,
                Linkedin = mentor.Linkedin,
                Bio = mentor.description,
                CvUrl = mentor.CvURL,
                AvailableSlots = mentor.mentor_Availabilities
                    .Where(a => a.date >= DateOnly.FromDateTime(DateTime.UtcNow))
                    .OrderBy(a => a.date)
                    .ThenBy(a => a.start_time)
                    .Select(a => new MentorSlotDto
                {
                    SlotId = a.Slot_Id,
                    Day = a.date.ToString("dddd, MMM d"),
                    Date = a.date.ToString("yyyy-MM-dd"),
                    StartTime = a.start_time.ToString("hh:mm tt"),
                    EndTime = a.start_time.Add(a.Duration).ToString("hh:mm tt"),
                    SessionType = a.paid_status.ToString(),
                    Price = a.priceSlot,
                    Platform = a.session_link,
                    IsBooked = a.is_booked
                }).ToList()
            };

            return Ok(result);
        }

        [HttpPut("SaveChange")]
        public async Task<IActionResult> edit([FromForm] UpdateMentorProfileDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (UserId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            if (!int.TryParse(UserId, out var id))
                return Unauthorized(new { message = "Unauthorized access" });

            var result = await _servicesOfMentor.UpdateProfile(dto, id);
            return result.Item1.statusCode switch
            {
                401 => Unauthorized(new { Info = result.Item1, Data = result.Item2 }),
                409 => Conflict(new { Info = result.Item1, Data = result.Item2 }),
                200 => Ok(new { Info = result.Item1, Data = result.Item2 }),
                400 => BadRequest(result.Item1),
                _ => StatusCode(500, new { Info = result.Item1, Data = result.Item2 })
            };
        }

        [HttpPost("availabilities")]
        public async Task<IActionResult> SetSlot([FromBody] AddMentorSlotDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            bool isPaid = dto.SessionType.ToLower().Contains("paid");
            if (isPaid && dto.Price <= 0)
                return BadRequest(new { message = "Price must be greater than 0 for Paid sessions." });
            if (!isPaid && dto.Price > 0)
                return BadRequest(new { message = "Price must be 0 for Free sessions." });

            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (UserId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            if (!int.TryParse(UserId, out var id))
                return Unauthorized(new { message = "Unauthorized access" });

            var slotDateTimeUtc = DateTime.SpecifyKind(dto.Date.ToDateTime(dto.StartTime), DateTimeKind.Utc);
            if (slotDateTimeUtc < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Cannot add a slot in the past." });
            }

            var mentor = await _context.Mentors.FirstOrDefaultAsync(m => m.user_id == id);
            if (mentor == null) return NotFound(new { message = "Mentor not found" });
            int mentorId = mentor.Mentor_Id;

            var existingSlots = await _context.Mentor_Availabilities
                .Where(a => a.mentor_id == mentorId && a.date == dto.Date)
                .ToListAsync();

            var newStart = dto.StartTime;
            var newEnd = dto.StartTime.Add(dto.Duration);

            bool isOverlap = existingSlots.Any(a =>
            {
                var existingStart = a.start_time;
                var existingEnd = a.start_time.Add(a.Duration);
                return newStart < existingEnd && existingStart < newEnd;
            });

            if (isOverlap)
            {
                return BadRequest(new { message = "You already have an overlapping slot at this time." });
            }

            var newSlot = new Mentor_Availability
            {
                mentor_id = mentorId,
                date = dto.Date,
                start_time = dto.StartTime,
                Duration = dto.Duration,
                paid_status = dto.SessionType.ToLower().Contains("paid") ? Baid_Status.Paid : Baid_Status.Unpaid,
                priceSlot = dto.Price,
                session_link = dto.Platform,
                is_booked = false
            };

            _context.Mentor_Availabilities.Add(newSlot);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Slot added successfully", slotId = newSlot.Slot_Id });
        }

        [HttpPut("time-slots/{slotId}")]
        public async Task<IActionResult> UpdateSlot(int slotId, [FromBody] AddMentorSlotDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            bool isPaid = dto.SessionType.ToLower().Contains("paid");
            if (isPaid && dto.Price <= 0)
                return BadRequest(new { message = "Price must be greater than 0 for Paid sessions." });
            if (!isPaid && dto.Price > 0)
                return BadRequest(new { message = "Price must be 0 for Free sessions." });

            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (UserId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            if (!int.TryParse(UserId, out var id))
                return Unauthorized(new { message = "Unauthorized access" });

            var slotDateTimeUtc = DateTime.SpecifyKind(dto.Date.ToDateTime(dto.StartTime), DateTimeKind.Utc);
            if (slotDateTimeUtc < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Cannot update a slot to a past date/time." });
            }

            var mentor = await _context.Mentors.FirstOrDefaultAsync(m => m.user_id == id);
            if (mentor == null) return NotFound(new { message = "Mentor not found" });
            int mentorId = mentor.Mentor_Id;

            var slot = await _context.Mentor_Availabilities
                .FirstOrDefaultAsync(s => s.Slot_Id == slotId && s.mentor_id == mentorId);

            if (slot == null) return NotFound(new { message = "Slot not found" });
            if (slot.is_booked) return BadRequest(new { message = "Cannot update a booked slot" });

            var existingSlots = await _context.Mentor_Availabilities
                .Where(a => a.mentor_id == mentorId && a.Slot_Id != slotId && a.date == dto.Date)
                .ToListAsync();

            var newStart = dto.StartTime;
            var newEnd = dto.StartTime.Add(dto.Duration);

            bool isOverlap = existingSlots.Any(a =>
            {
                var existingStart = a.start_time;
                var existingEnd = a.start_time.Add(a.Duration);
                return newStart < existingEnd && existingStart < newEnd;
            });

            if (isOverlap)
            {
                return BadRequest(new { message = "You already have another overlapping slot at this time." });
            }

            slot.date = dto.Date;
            slot.start_time = dto.StartTime;
            slot.Duration = dto.Duration;
            slot.paid_status = dto.SessionType.ToLower().Contains("paid") ? Baid_Status.Paid : Baid_Status.Unpaid;
            slot.priceSlot = dto.Price;
            slot.session_link = dto.Platform;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Slot updated successfully" });
        }

        [HttpDelete("time-slots/{slotId}")]
        public async Task<IActionResult> DeleteSlot(int slotId)
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (UserId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            if (!int.TryParse(UserId, out var id))
                return Unauthorized(new { message = "Unauthorized access" });

            var mentor = await _context.Mentors.FirstOrDefaultAsync(m => m.user_id == id);
            if (mentor == null) return NotFound(new { message = "Mentor not found" });
            int mentorId = mentor.Mentor_Id;
            var slot = await _context.Mentor_Availabilities
                .FirstOrDefaultAsync(s => s.Slot_Id == slotId && s.mentor_id == mentorId);

            if (slot == null) return NotFound(new { message = "Slot not found" });
            if (slot.is_booked) return BadRequest(new { message = "Cannot delete a booked slot" });

            _context.Mentor_Availabilities.Remove(slot);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Slot deleted successfully" });
        }
    }
}