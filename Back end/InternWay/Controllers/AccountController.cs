using InternWay.DTOs;
using InternWay.IServices;
using InternWay.Models.auth_schema;
using InternWay.Models.company_schema;
using InternWay.Models.mentor_schema;
using InternWay.Models.student_schema;
using InternWay.Services.Share;
using InternWay.Services.StudentServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace InternWay.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        
        private readonly UserManager<User> userManager;
        private readonly CloudinaryService cloudinaryService;
        private readonly InternShipWayDB internShipWay;
        private readonly SignInManager<User> signInManager;
        private readonly IAppEmailSender _emailSender;
        private readonly IServicesOfMentor servicesOfMentor;
        private readonly AccountServices accountServices;
        private readonly IWebHostEnvironment webHostEnvironment;
        private readonly ServicesExternalAi externalAi;

        public AccountController(
           
            UserManager<User> userManager 
            , CloudinaryService cloudinaryService 
            , InternShipWayDB internShipWay
            , SignInManager<User> signInManager
            ,IAppEmailSender emailSender
            ,IServicesOfMentor servicesOfMentor
            , AccountServices accountServices
            , IWebHostEnvironment webHostEnvironment
            ,ServicesExternalAi externalAi
            )
        {
           
            this.userManager = userManager;
            this.cloudinaryService = cloudinaryService;
            this.internShipWay = internShipWay;
            this.signInManager = signInManager;
            this._emailSender = emailSender;
            this.servicesOfMentor = servicesOfMentor;
            this.accountServices = accountServices;
            this.webHostEnvironment = webHostEnvironment;
            this.externalAi = externalAi;
        }

       
        [AllowAnonymous]
        [HttpPost("signUp/student")]
        public async Task<IActionResult> StudentSignUp(StudentDto student)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
          
            
            var result =  await accountServices.StudentSignUP(student);

                return result.StatusCode switch
                {
                    "409" => Conflict(new { errorMessage = result.Message }),
                    "400" => BadRequest(new { errorMessage = result.Message }),
                    "500" => StatusCode(StatusCodes.Status500InternalServerError,
                            new { errorMessage = result.Message }),
                    "201" => Created(" ", result.Message),
                    _ => StatusCode(StatusCodes.Status500InternalServerError,
                           new { errorMessage = result.Message })

                };

            
            
        }

        [AllowAnonymous]
        [HttpPost("signUp/mentor")]
        public async Task<IActionResult> MentorSignUpAsync(MentorDto mentor) 
        {
            if (ModelState.IsValid)
            {
                var existedUser = await userManager.FindByEmailAsync(mentor.email);
                if (existedUser != null)
                    return BadRequest(new { message = "An account with this email already exists , Try signing in or use another email" });
               
                var user = new User()
                {
                    Full_Name = mentor.fullName,
                    Email = mentor.email,
                    UserName = mentor.email,
                    Role = Models.auth_schema.User.Roles.mentor
                };
                var result1 = await userManager.CreateAsync(user, mentor.password);
                var result2 = await userManager.AddToRoleAsync(user, "mentor");
               
                if (result1.Succeeded && result2.Succeeded )
                {
                    if (!cloudinaryService.ValidationCvUpLoad(mentor.cvFile, out string error))
                    {
                        await userManager.DeleteAsync(user);
                        return BadRequest(new { message = error });
                    }

                    var cvUploadResult = await cloudinaryService.UploadCvAsync(mentor.cvFile, user.Id.ToString());
                    if (string.IsNullOrEmpty(cvUploadResult.fileName) || string.IsNullOrEmpty(cvUploadResult.PublicId))
                    {
                        await userManager.DeleteAsync(user);
                        return StatusCode(500, new { message = "File upload failed. Please try again." });
                    }

                    var cvUrlResult = await cloudinaryService.DownloadCv(cvUploadResult.PublicId, cvUploadResult.fileName);

                    var Mentor = new Mentor()
                    { 
                        user_id = user.Id,
                        Job_Title = mentor.jobTitle,
                        Years_Experience = mentor.yearsExperience,
                        Linkedin = mentor.linkedin,
                        CvPublicID = cvUploadResult.PublicId,
                        CvFileName = cvUploadResult.fileName,
                        CvURL = cvUrlResult.message,
                        location = "Not Specified"
                    };
                  
                    await internShipWay.Mentors.AddAsync(Mentor);
                    await internShipWay.SaveChangesAsync();

                    var InfoCv = await externalAi.GetCvFilePath(mentor.cvFile, Mentor.Mentor_Id);
                    var OperationId = Hangfire.BackgroundJob.Enqueue<ServicesExternalAi>(e => 
                        e.ExtractAndStoreMentorInformation(InfoCv.filePath, InfoCv.length, Mentor.Mentor_Id)
                    );

                    return Created("", new { message = "The mentor account has been created successfully" });
                }
              
                foreach (var error in result1.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }
                foreach (var error in result2.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }
                return BadRequest(ModelState);
            }
            return BadRequest(ModelState);
        }

        [AllowAnonymous]
        [HttpPost("signUp/company")]
        public async Task<IActionResult> CompanySignUpAsync(CompanyDto company) 
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
           
            var result = await accountServices.CompanySignUP(company);
               
                return result.StatusCode switch
                {
                    "409" => Conflict(new { errorMessage = result.Message }) ,
                    "400" => BadRequest(new { errorMessage = result.Message }) ,
                    "500" => StatusCode(StatusCodes.Status500InternalServerError,
                            new { errorMessage = result.Message }),
                    "201" => Created(" ", result.Message) ,
                    _ => StatusCode(StatusCodes.Status500InternalServerError,
                           new { errorMessage = result.Message })
                };
            
           
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto) 
        { 
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
           
            var result = await accountServices.UserLogin(dto);
                if(!string.IsNullOrEmpty(result.Item2.refreshToken))
                {
                 await SetRefreshTokenInCookies(result.Item2.refreshToken , result.Item2.refreshTokenexpiredAt);
                }
                return result.StatusCode switch
                {
                 "200" => Ok(result.Item2),
                 "400" => BadRequest(result.Item2),
                 "500" => StatusCode(StatusCodes.Status500InternalServerError 
                 , new { errorMessage = result.Item2.message }),
                    _ => StatusCode(StatusCodes.Status500InternalServerError,
                             new { errorMessage = result.Item2.message })
                };
            
          
        }
        [AllowAnonymous]
        [HttpGet("refreshtoken")]
        public async Task<IActionResult> GetNewTokens()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (refreshToken == null)
                return Unauthorized();

            var result = await accountServices.setTokens(refreshToken);
            if (!string.IsNullOrEmpty(result.Item2.refreshToken))
              await  SetRefreshTokenInCookies(result.Item2.refreshToken, result.Item2.refreshTokenexpiredAt);
          
            return result.StatusCode switch
            {
                "200" => Ok(result.Item2),
                "401" => Unauthorized(result.Item2),
                "500" => StatusCode(StatusCodes.Status500InternalServerError
                , new { errorMessage = result.Item2.message }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                         new { errorMessage = result.Item2.message })
            };
        }
        [AllowAnonymous]
        [HttpDelete("logout")]
        public async Task<IActionResult> LogOut()
        {
            var refreshtoken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshtoken))
                return BadRequest();
            var result = await accountServices.SetRevokedToken(refreshtoken);
            if(!result)
                return BadRequest();
            Response.Cookies.Delete("refreshToken" , new CookieOptions()
            {
                HttpOnly = true,
                Secure = !webHostEnvironment.IsDevelopment(),
              

            });
            return Ok();

        }
        [AllowAnonymous]
        [HttpPost("forgetpassword")]
        public async Task<IActionResult> ForgetPassword(ForgetPasswordDto dto)
        {

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await accountServices.ForgetPassword(dto);
            return result.StatusCode switch
            {
                "200" => Ok(new { message = result.Message }),
                "400" => BadRequest(new { errorMessage = result.Message }),
                "500" => StatusCode(StatusCodes.Status500InternalServerError
                , new { errorMessage = result.Message }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                         new { errorMessage = result.Message })
            };
        }
        [AllowAnonymous]
        [HttpPost("resetpassword")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
        {
           if(!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await accountServices.ResetPassword(dto);
            return result.StatusCode switch
            {
                "200" => Ok( result.Message ),
                "400" => BadRequest( result.Message ),
                "500" => StatusCode(StatusCodes.Status500InternalServerError
                , result.Message ),
                _ => StatusCode(StatusCodes.Status500InternalServerError
                 ,  result.Message )
            };
        }
        private async Task SetRefreshTokenInCookies(string RefreshToken , DateTime expire)
        {
            var CookieOptions = new CookieOptions()
            {
                HttpOnly = true,
                Secure = !webHostEnvironment.IsDevelopment(),
                Expires = expire

            };
            Response.Cookies.Append("refreshToken", RefreshToken, CookieOptions);

        }

    }
}
