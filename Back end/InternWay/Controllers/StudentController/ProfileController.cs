using InternWay.DTOs;
using InternWay.DTOs.StudentModels;
using InternWay.IServices;
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
    public class ProfileController : ControllerBase
    {
        private readonly IServicesOfStudent servicesOfStudent;

        public ProfileController(IServicesOfStudent servicesOfStudent)
        {
            this.servicesOfStudent = servicesOfStudent;
        }

        [HttpGet]
        public async Task<IActionResult> profileData()
        {
           var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
           
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if(!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var dataStudent = await servicesOfStudent.GetDataBystudent(id);
           
            return dataStudent.StatusCode switch
            {
                401 => Unauthorized(new { Message = "User Unauthorized ", Data = dataStudent.Item1 }),
                200 => Ok(new { Message = "Profile of student is retrieved successfully .", Data = dataStudent.Item1 }),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = "Something went wrong. Please try again.", Data = dataStudent.Item1 }),
                 _ => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = "Something went wrong. Please try again.", Data = dataStudent.Item1 })
            };
           
        }
        
        [HttpPut("SaveChange")]
        public async Task<IActionResult> Edit(RequestUpdateStudentDto EditedStudent)
        {
            if(!ModelState.IsValid)
                return BadRequest(ModelState);

            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
           
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");

            var result =  await servicesOfStudent.UpdateProfile(EditedStudent, id);
            return result.Item1.statusCode switch
            {
                401 => Unauthorized(new { Info = result.Item1, Data = result.Item2 }),
                409 => Conflict(new { Info = result.Item1, Data = result.Item2 }),
                200 => Ok(new { Info = result.Item1, Data = result.Item2 }),
                400 => BadRequest(result.Item1),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = "Something went wrong. Please try again.", Data = result.Item2 }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = "Something went wrong. Please try again.", Data = result.Item2 })
            };
        }
    } 
}
