using InternWay.DTOs.StudentModels;
using InternWay.IServices;
using InternWay.Models.mentor_schema;
using InternWay.Models.student_schema;
using InternWay.Services.StudentServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace InternWay.Controllers.StudentController
{
    [Route("Student/[controller]")]
    [ApiController]
    [Authorize(Roles = "student")]
    public class SessionsController : ControllerBase
    { 
        private readonly IServicesOfStudent servicesOfStudent;

        public SessionsController(IServicesOfStudent servicesOfStudent)
        {
            this.servicesOfStudent = servicesOfStudent;
        }
       
        [HttpGet("get")]
        public async Task<IActionResult> getAllSession() 
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
           
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfStudent.GetAllSortedBookedSessionByStudent(id);
            return result.StatusCode switch
            {
                401 => Unauthorized(new { Message = result.message, Data = result.Item1 }),
                404 => NotFound(new { Message = result.message, Data = result.Item1 }),
                200 => Ok(new { Message = result.message, Data = result.Item1 }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.message, Data = result.Item1 }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message, Data = result.Item1 })
            };
        }
      
        [HttpDelete("session/cancel/{sessionId}")]
        public async Task<IActionResult> CancelSession(int sessionId) 
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
          
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfStudent.deleteSession(sessionId, id);
            return result.statusCode switch
            {
                401 => Unauthorized(result.Item2),
                403 =>  StatusCode(403, result.Item2),
                400 => BadRequest(result.Item2),
                200 => Ok(result.Item2),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.Item2 }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.Item2 })
            };
        }
      
        [HttpPut("session/reschedule/{sessionId}")]
        public async Task<IActionResult> rescheduleSession(int sessionId, BookingRequestDto BookRequest)
        {

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
          
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfStudent
                .rescheduleSession(sessionId, BookRequest.slotId, BookRequest.topicId, id);
          
            return result.statusCode switch
            {
                401 => Unauthorized(result.Item2),
                404 => NotFound(result.Item2),
                403 => StatusCode(403, result.Item2),
                400 => BadRequest(result.Item2),
                200 => Ok(result.Item2),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.Item2 }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.Item2 })
            };

        }
       
        [HttpGet("meeting/join/{sessionId}")]
        public async Task< IActionResult> joinMeeting(int sessionId)
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfStudent.JoinMeeting(sessionId, id);
               

            return result.statusCode switch
            {
                401 => Unauthorized(result.message),
                404 => NotFound(result.message),
                403 => StatusCode(403, result.message),
                400 => BadRequest(result.message),
                200 => Ok(new { Message = result.message, Link = result.link }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.message }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message })
            };
        }

        [HttpPost("session/review")]
        public async Task<IActionResult> AddReview(ReviewRequestDto reviewRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
           
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfStudent
               .AddReviewForMentorByStudent(reviewRequest, id);

            return result.statusCode switch
            {
                401 => Unauthorized(result.message),
                404 => NotFound(result.message),
                403 => StatusCode(403, result.message),
                400 => BadRequest(result.message),
                200 => Ok(result.message),
                201 => Created("" , result.message),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.message }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message })
            };

        }
       

    }
}
