using InternWay.IServices;
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
    public class InternshipsController : ControllerBase
    {
        private readonly IServicesOfInternship servicesOfInternship;
        private readonly IServicesOfStudent servicesOfStudent;

        public InternshipsController(IServicesOfInternship servicesOfInternship , IServicesOfStudent servicesOfStudent)
        {
            this.servicesOfInternship = servicesOfInternship;
            this.servicesOfStudent = servicesOfStudent;
        }
        
        [HttpGet]
        public async Task<IActionResult> getAllInternships()
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
           
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfInternship.getAllOpenInternship();
            return result.StatusCode switch
            {
                401 => Unauthorized(new { Message = result.message, data = result.Item1 }),
                200 => Ok(new { Message = result.message, data = result.Item1 }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.message, data = result.Item1 }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message, data = result.Item1 })
            };
        }
       
        [HttpGet("get/matchscore")]
        public async Task<IActionResult> getAllMatchScoreOfInternships()
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
           
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfStudent.GetMatchScoreOfStudent(id);
            return result.statusCode switch
            {
                400 => BadRequest(result.message),
                401 => Unauthorized(result.message),
                403 => StatusCode(403, result.message),
                200 => Ok(new { message = result.message, data = result.Item1 }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.message }),
                502 => StatusCode(StatusCodes.Status502BadGateway, new { errorMessage = result.message }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message })
            };
        }

        [HttpGet("view/details/{internId}")]
        public async Task<IActionResult> viewDetails([FromRoute(Name = "internId")]int internshipId) 
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
          
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfInternship.viewDetailsofInternForStudentAsync(internshipId);
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

        [HttpPost("internship/apply/{internshipId}")]
        public async Task<IActionResult> ApplyNow( int internshipId)
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
         
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfInternship.applyNow(id , internshipId);
            return result.statuscode switch
            {
                401 => Unauthorized(result.message),
                404 => NotFound(result.message),
                400 => BadRequest(result.message),
                409 => Conflict(result.message),
                200 => Ok(result.message),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.message }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message })
            };
        }

    }
}
