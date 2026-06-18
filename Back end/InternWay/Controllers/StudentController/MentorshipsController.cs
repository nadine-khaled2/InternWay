using InternWay.DTOs.StudentModels;
using InternWay.IServices;
using InternWay.Models.mentor_schema;
using InternWay.Services.CompanyServices;
using InternWay.Services.MentorServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace InternWay.Controllers.StudentController
{
    [Route("Student/[controller]")]
    [ApiController]
    [Authorize(Roles = "student")]
    public class MentorshipsController : ControllerBase
    {
        private readonly IServicesOfStudent servicesOfStudent;
        private readonly InternShipWayDB _context;
        private readonly INotificationService _notificationService;

        public MentorshipsController(IServicesOfStudent servicesOfStudent, InternShipWayDB context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
            this.servicesOfStudent = servicesOfStudent;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMentorships()
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfStudent.GetAllMentorsForStudent();
            return result.StatusCode switch
            {
                200 => Ok(new {Message = result.message , Data = result.Item1}),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.message, Data = result.Item1 }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message, Data = result.Item1 })
            };

        }

        [HttpGet("view/details/mentor/{mentorId}")]
        public async Task<IActionResult> GetProfileOfMentor(int mentorId)
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfStudent.GetDetailsOfMentorForStudent(mentorId);
            return result.StatusCode switch
            {
                404 => NotFound(new { Message = result.message, Data = result.Item1 }),
                200 => Ok(new { Message = result.message, Data = result.Item1 }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.message, Data = result.Item1 }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message, Data = result.Item1 })
            };

        }

        [HttpGet("mentors/available-slots/{mentorId}")]
        public async Task<IActionResult> getAvailabilities(int mentorId)
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfStudent.GetAllAvailabilitiesOfMentor(mentorId);
            return result.StatusCode switch
            {
                404 => NotFound(new { Message = result.message, Data = result.Item1 }),
                200 => Ok(new { Message = result.message, Data = result.Item1 }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.message, Data = result.Item1 }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message, Data = result.Item1 })
            };
        }

        [HttpGet("session/topic")]
        public async Task<IActionResult> GetSessionTopics()
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfStudent.GetAllSessionTopic();
            return result.StatusCode switch
            {
                404 => NotFound(new { Message = result.message, Data = result.Item1 }),
                200 => Ok(new { Message = result.message, Data = result.Item1 }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.message, Data = result.Item1 }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message, Data = result.Item1 })
            };
        }

        [HttpPost("mentors/Session/book")]
        public async Task<IActionResult> BookingSession(BookingRequestDto BookRequest)
        {

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfStudent.addSession(BookRequest.slotId, id, BookRequest.topicId);

              if (result.statusCode == 200 && result.sessionId.HasValue)
              {
                  var slot = await _context.Mentor_Availabilities.Include(m => m.Mentor).FirstOrDefaultAsync(s => s.Slot_Id == BookRequest.slotId);
                    if (slot != null && slot.Mentor != null)
                    {
                        var studentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
                        string studentName = studentUser?.Full_Name ?? "A student";
                        string topicName = ((Mentorship_Session.Topic)BookRequest.topicId).ToString().Replace("_", " ");
                        string message = $"{studentName} has requested a {topicName} session. Please review and approve.";
                        await _notificationService.CreateAndSendNotificationAsync(slot.Mentor.user_id, "New Session Request", message, "MentorSession", result.sessionId.Value);
                    }
              }
            return result.statusCode switch
            {
                401 => Unauthorized(result.message),
                404 => NotFound(result.message),
                400 => BadRequest(result.message),
                200 => Ok(result.message),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.message }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message })
            };

        }
    }
}

