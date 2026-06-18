using InternWay.DTOs.CompanyModels;
using InternWay.DTOs.StudentModels;
using InternWay.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace InternWay.Controllers.CompanyController
{
    [Route("company/[controller]")]
    [ApiController]
    [Authorize(Roles ="company")]
    public class ProfileController : ControllerBase
    {
        private readonly IServicesOfCompany servicesOfCompany;

        public ProfileController(IServicesOfCompany servicesOfCompany)
        {
            this.servicesOfCompany = servicesOfCompany;
        }
       
        [HttpGet]
        public async Task<IActionResult> profileData()
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfCompany.getprofileOfCompany(id);
            return result.StatusCode switch
            {
                404 => NotFound(new { Message = "Not found company .", Data = result.Item1 } ),
                400 => BadRequest(new { Message = "Please enter a valid year.", Data = result.Item1 }),
                200 => Ok(new { Message = "Profile company is retrieved successfully .", Data = result.Item1 }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = "Something went wrong. Please try again.", Data = result.Item1 }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = "Something went wrong. Please try again.", Data = result.Item1 })
            };

        }
        
        [HttpPut("SaveChange")]
        public async Task<IActionResult> Edit(EditCompanyDto Editedcompany)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfCompany.EditCompany(Editedcompany, id);
            return result.statusCode switch
            {
                404 => NotFound(new { Message = "Not found company .", Data = result.Item1 }),
                409 => Conflict(new { Message = "This email is already in use. Please use a different email.", Data = result.Item1 }),
                400 => BadRequest(new { Message = "Update failed.Please try again.", Data = result.Item1 }),
                200 => Ok(new { Message = "Company is edited successfully ", Data = result.Item1 }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = "Something went wrong. Please try again.", Data = result.Item1  }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = "Something went wrong. Please try again." , Data = result.Item1 })
            };


        }
    }
}
