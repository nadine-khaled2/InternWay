using InternWay.DTOs;
using InternWay.IServices;
using InternWay.Services.CompanyServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InternWay.Controllers.CompanyController
{
    [Route("company/[controller]")]
    [ApiController]
    [Authorize(Roles = "company")]
    public class DashboardController : ControllerBase
    {
        private readonly IServicesOfCompany servicesOfCompany;
       
        public DashboardController(IServicesOfCompany servicesOfCompany)
        {
            this.servicesOfCompany = servicesOfCompany;
        }

        [HttpGet]
        public async Task< IActionResult> getDashboard()
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfCompany.getDataOfCompany(id);
            return result.StatusCode switch
            {
                404 => NotFound(new { Message = result.message, Data = result.Item3 }),
                200 => Ok(new { Message = result.message, Data = result.Item3 }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage =result.message, Data = result.Item3 }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message , Data = result.Item3 })
            };
        }
      
        [HttpGet("view/details/{internId}")]
        public async Task<IActionResult> GetDetailsOfIntern(int internId )
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result = await servicesOfCompany.ViewDetailsOfInternForcompany(internId, id);
            return result.statusCode switch
            {
                401 => Unauthorized(new { Message = result.message, Data = result.Item1 }),
                404 => NotFound(new { Message = result.message, Data = result.Item1 }),
                200 => Ok(new { Message = result.message, Data = result.Item1 }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.message , Data = result.Item1 }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.message , Data = result.Item1 })
            };


        }
        
    }
}
