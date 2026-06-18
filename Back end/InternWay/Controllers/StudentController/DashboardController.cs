using InternWay.DTOs.StudentModels;
using InternWay.IServices;
using InternWay.Models.mentor_schema;
using InternWay.Services.CompanyServices;
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
    public class DashboardController : ControllerBase
    {
        private readonly IServicesOfStudent servicesOfStudent;
        private readonly IServicesOfInternship servicesOfInternship;
        private readonly InternShipWayDB internShipWay;

        public DashboardController(IServicesOfStudent servicesOfStudent , IServicesOfInternship servicesOfInternship , InternShipWayDB internShipWay) 
        {
            this.servicesOfStudent = servicesOfStudent;
            this.servicesOfInternship = servicesOfInternship;
            this.internShipWay = internShipWay;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetDashboardOfStudent()
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
           
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfStudent.GetDashboardOfStudent(id);
            return result.StatusCode switch
            {
                401 => Unauthorized(new { Message = result.message, Data = result.Item1 }),
                200 => Ok(new { Message = result.message, Data = result.Item1 }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.message, Data = result.Item1 }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message, Data = result.Item1 })
            };
        }
      
        [HttpGet("get/recommendedinternships")]
        public async Task<IActionResult> GetRecommendedInternships() 
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
           
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");
           
            var result = await servicesOfStudent.GetRecommendedInternships(id);
            return result.StatusCode switch
            {   
                400 => BadRequest(new { Message = result.message, Data = result.Item1 }),
                401 => Unauthorized(new { Message = result.message, Data = result.Item1 }),
                403 => StatusCode(403 , new { Message = result.message, Data = result.Item1 }),
                200 => Ok(new { Message = result.message, Data = result.Item1 }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.message, Data = result.Item1 }),
                502 => StatusCode(StatusCodes.Status502BadGateway, new { errorMessage = result.message }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message, Data = result.Item1 })
            };

        }
       
        [HttpGet("get/recommendedmentorships")]
        public async Task<IActionResult> GetRecommendedMentorships()
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
           
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");
           
            var result = await servicesOfStudent.GetRecommendedMentors(id);
            return result.StatusCode switch
            {
                400 => BadRequest(new { Message = result.message, Data = result.Item1 }),
                401 => Unauthorized(new { Message = result.message, Data = result.Item1 }),
                403 => StatusCode(403, new { Message = result.message, Data = result.Item1 }),
                200 => Ok(new { Message = result.message, Data = result.Item1 }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.message, Data = result.Item1 }),
                502 => StatusCode(StatusCodes.Status502BadGateway, new { errorMessage = result.message }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message, Data = result.Item1 })
            };

        }

       

    }
}
