using InternWay.DTOs;
using InternWay.DTOs.CompanyModels;
using InternWay.IServices;
using InternWay.Services.StudentServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InternWay.Controllers.CompanyController
{
    [Route("company/[controller]")]
    [ApiController]
    [Authorize(Roles = "company")]
    public class MyInternshipsController : ControllerBase
    {
        private readonly IServicesOfCompany servicesOfCompany;
        
        public MyInternshipsController(IServicesOfCompany servicesOfCompany)
        {
            this.servicesOfCompany = servicesOfCompany;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetAllInternships()
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfCompany.GetAllInternshipForCompany(id);
            return result.statusCode switch
            {
                401 => Unauthorized(new { Message = "User Unauthorized ", Data = result.Item1 }),
                404 => NotFound(new { Message = " Not founded internships", Data = result.Item1 }),
                200 => Ok(new { Message = "Internships are retrieved successfully", Data = result.Item1 }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = "Something went wrong. Please try again.", Data = result.Item1 }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = "Something went wrong. Please try again.", Data = result.Item1 })
            };

        }

        [HttpGet("view/applicants/{internId}")]
        public async Task<IActionResult> GetAllApplicantsOfInternship( int internId)
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
          
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");
           
            var result = await servicesOfCompany.ViewApplicantsByIntern(internId, id);
            return result.statusCode switch
            {
                401 => Unauthorized(new { Message = result.message, Data = result.Item1 }),
                404 => NotFound(new { Message = result.message, Data = result.Item1 }),
                400 => BadRequest(new { Message = result.message, Data = result.Item1 }),
                200 => Ok(new { Message = result.message, Data = result.Item1 }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.message, Data = result.Item1 }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message, Data = result.Item1 })
            };
        }
        [HttpGet("get/matchscore/{internId}")]
        public async Task<IActionResult> GetMatchScoreOfApplicantsForInternship(int internId)
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfCompany.GetMatchScoreOfApplicants(internId , id);
            return result.statusCode switch
            {
                400 => BadRequest(new { message = result.message, data = result.Item1 }),
                401 => Unauthorized(new { message = result.message, data = result.Item1 }),
                403 => StatusCode(403,
                       new { errorMessage = result.message }),
                404 => NotFound(new { message = result.message, data = result.Item1 }),
                200 => Ok(new { message = result.message, data = result.Item1 }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.message , data = result.Item1 }),
                502 => StatusCode(StatusCodes.Status502BadGateway, new { errorMessage = result.message , data = result.Item1 }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message , data = result.Item1 })
            };
        }

        [HttpGet("get/{id}")]
        public async Task<IActionResult> GetDataeditingIntern([FromRoute(Name = "id")] int internId)
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfCompany.GetDataForEditingIntern(internId , id);
            return result.statusCode switch
            {
                401 => Unauthorized(new { Message = "User Unauthorized .", Data = result.Item1 }),
                404 => NotFound(new { Message = " Not found internship ." , Data = result.Item1 }),
                200 => Ok(new { Message = "Data of Internship is retrieved successfully. ", Data = result.Item1 }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = "Something went wrong. Please try again.", Data = result.Item1 }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = "Something went wrong. Please try again.", Data = result.Item1 })
            };
        }

        [HttpPut("internship/edite/savechange")]
        public async Task<IActionResult> EditInternship(RequestEditedInternshipDto EditingInternship)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfCompany.EditIntern(id, EditingInternship);
            return result.statusCode switch
            {
                401 => Unauthorized(new { Message = result.message, Data = result.Item1 }),
                404 => NotFound(result.message),
                400 => BadRequest(new { Message = result.message, Data = result.Item1 }),
                200 => Ok(new { Message = result.message , Data = result.Item1 }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.message, Data = result.Item1 }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message, Data = result.Item1 })
            };
        }
       
        [HttpPut("internship/close/{id}")]
        public async Task<IActionResult> CloseInternship([FromRoute(Name ="id")]int internId)
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
          
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfCompany.CloseIntern(internId , id);
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
       
        [HttpPut("internship/reopen/{id}")]
        public async Task<IActionResult> ReopenInternship([FromRoute(Name ="id")]int Internid , [FromBody] OpenInternRequest requestOpen)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
          
            requestOpen.internshipId = Internid;
           
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfCompany.OpenIntern(requestOpen , id);
            return result.statusCode switch
            {
                401 => Unauthorized(result.message),
                404 => NotFound(result.message),
                400 => BadRequest(result.message),
                200 => Ok( result.message ),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.message }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message })
            };
        }
        
        [HttpDelete("internship/delete/{id}")]
        public async Task<IActionResult> DeleteInternship([FromRoute(Name = "id")] int internId)
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfCompany.DeleteIntern(internId, id);
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
      
        [HttpPost("internship/post")]
        public async Task<IActionResult> AddInternship(NewInternshipDto internshipDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfCompany.AddIntern(internshipDto, id);
            return result.StatusCode switch
            {
                401 => Unauthorized(result.Message),
                404 => NotFound(result.Message),
                400 => BadRequest(result.Message),
                200 => Ok( result.Message),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.Message }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.Message })
            };

        }

    }
}
