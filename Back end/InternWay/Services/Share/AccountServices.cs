using Hangfire;
using InternWay.DTOs;
using InternWay.IServices;
using InternWay.Models.auth_schema;
using InternWay.Models.company_schema;
using InternWay.Models.student_schema;
using InternWay.Services.CompanyServices;
using InternWay.Services.MentorServices;
using InternWay.Services.StudentServices;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace InternWay.Services.Share
{// كله test 
    public class AccountServices

    {
        private readonly IConfiguration configuration;
        private readonly UserManager<User> userManager;
        private readonly CloudinaryService cloudinaryService;
        private readonly ServicesExternalAi servicesExternalAi;
        private readonly InternShipWayDB internShipWay;
        private readonly IServicesOfStudent servicesOfStudent;
        private readonly SignInManager<User> signInManager;
        private readonly IAppEmailSender emailSender;
        private readonly IServicesOfCompany servicesOfCompany;

        public AccountServices(
            IConfiguration configuration
            , UserManager<User> userManager
            , CloudinaryService cloudinaryService
            , ServicesExternalAi servicesExternalAi
            , InternShipWayDB internShipWay
            , IServicesOfStudent servicesOfStudent
            , SignInManager<User> signInManager
            , IAppEmailSender _emailSender
            , IServicesOfCompany servicesOfCompany
            )
        {
            this.configuration = configuration;
            this.userManager = userManager;
            this.cloudinaryService = cloudinaryService;
            this.servicesExternalAi = servicesExternalAi;
            this.internShipWay = internShipWay;
            this.servicesOfStudent = servicesOfStudent;
            this.signInManager = signInManager;
            emailSender = _emailSender;
            this.servicesOfCompany = servicesOfCompany;
        }
        private async Task<string> GenerateAccessTokenAsync(User user)
        { 
            var Claims = new List<Claim>()
            { 
                new Claim(ClaimTypes.NameIdentifier , user.Id.ToString()),
                new Claim (ClaimTypes.Role , user.Role.ToString()),
                new Claim(ClaimTypes.Email , user.Email),
                new Claim(JwtRegisteredClaimNames.Jti , Guid.NewGuid().ToString())
            };
            
            var aud = configuration["jwt:audience"];

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["jwt:key"]));

            var SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: configuration["jwt:issuer"],
                audience: configuration["jwt:audience"],
                claims: Claims,
                signingCredentials: SigningCredentials,
                expires: DateTime.UtcNow.AddMinutes(30)
                );

            return new JwtSecurityTokenHandler().WriteToken(token);

        }
        private RefreshToken GenerateRefreshToken()
        {
            return new RefreshToken()
            {
                Token = Guid.NewGuid().ToString(),
                CreateOn = DateTime.UtcNow,
                ExpireOn = DateTime.UtcNow.AddDays(10)

            };
        }
        public async Task<(string StatusCode, string Message)> StudentSignUP(StudentDto student)
        {
            User user = new User();
            var Strategy =  internShipWay.Database.CreateExecutionStrategy();
            return await Strategy.ExecuteAsync(async () => 
            {
                await using var transaction = await internShipWay.Database
                                                        .BeginTransactionAsync();
                try

                {
                    var existedUser = await userManager.FindByEmailAsync(student.email);

                    if (existedUser != null)
                        return ("409", "An account with this email already exists , Try signing in or use another email");

                    if (!cloudinaryService.ValidationCvUpLoad(student.cvFile, out String error))
                        return ("400", error);

                    user = new User()
                    {

                        Full_Name = student.fullName,

                        Email = student.email,

                        UserName = student.email,

                        PhoneNumber = student.phone,

                        Role = Models.auth_schema.User.Roles.student
                    };
                    var result1 = await userManager.CreateAsync(user, student.password);
                    if (!result1.Succeeded)
                        return ("400", "User creation failed");
                    

                    var result2 = await userManager.AddToRoleAsync(user, "student");
                    if (!result2.Succeeded)
                    {
                        await userManager.DeleteAsync(user);
                        return ("400", "Role assignment failed");
                    }

                    var CvpublicModel = await cloudinaryService.UploadCvAsync(student.cvFile, user.Id.ToString());
                  
                    var PublicId = CvpublicModel.PublicId.CleanPublicId();
                  
                    if (string.IsNullOrEmpty(CvpublicModel.fileName) 
                    || string.IsNullOrEmpty(CvpublicModel.PublicId) )
                    {
                        await userManager.DeleteAsync(user);
                        return ("500", "File upload failed. Please try again and complete the signup process.");
                    }
                  
                    if (!int.TryParse(student.gradYear, out int Gy))
                        return ("400", "Graduation year must be a valid numeric value (e.g., 2026). ");

                    var Student = new Student()
                    {
                        user_id = user.Id,

                        University = student.university,

                        College = student.college,

                        Degree = student.degree,

                        Major = student.major,

                        Graduation_Year = Gy,

                        CvPublicID = PublicId,

                        CvFileName = CvpublicModel.fileName,

                        IsCompleteAccount = false
                    };

                    await internShipWay.Students.AddAsync(Student);


                    await internShipWay.SaveChangesAsync();


                    await transaction.CommitAsync();


                    var InfoCv = await servicesExternalAi
                    .GetCvFilePath(student.cvFile, Student.Student_Id);

                    var OperationId = BackgroundJob
                    .Enqueue<ServicesExternalAi>(e => e.ExtractAndStoreInformation(
                        InfoCv.filePath, InfoCv.length, Student.Student_Id
                        ));

                    return ("201", "The student account has been created successfully");

                }
                catch (Exception )
                {
                    if (user != null && user.Id != 0)
                    {
                        await userManager.DeleteAsync(user);
                    }
                    await transaction.RollbackAsync();

                    return ("500", "Something went wrong while processing your request. Please try again.");
                }


            });
        }
        public async Task<(string StatusCode, string Message)> CompanySignUP(CompanyDto company)
        {
            User? user = null;
            var Strategy = internShipWay.Database.CreateExecutionStrategy();
            return await Strategy.ExecuteAsync(async () => 
            {
                 
                try
                {
                    var existedUser = await userManager.FindByEmailAsync(company.email);
                    if (existedUser != null)
                        return ("409", "An account with this email already exists , Try signing in or use another email");

                    user = new User()
                    {
                        Full_Name = company.companyName,
                        Email = company.email,
                        UserName = company.email,
                        PhoneNumber = company.phone,
                        Role = Models.auth_schema.User.Roles.company
                    };
                    var result1 = await userManager.CreateAsync(user, company.password);
                    if (!result1.Succeeded)
                        return ("400", "Account creation failed. Please try again.");

                    var result2 = await userManager.AddToRoleAsync(user, "company");
                    if (!result2.Succeeded)
                    {
                        await userManager.DeleteAsync(user);
                        return ("400", "Account creation failed. Please try again."); 
                    }



                    var Company = new Company()
                    {
                        user_id = user.Id,
                        company_name = company.companyName,
                        industry = company.industry,
                        location = company.location,
                        description = company.description,
                        website = company.webSite,
                        officeAddress = company.address
                    };
                    await internShipWay.Companies.AddAsync(Company);
                    await internShipWay.SaveChangesAsync();

                    return ("201", "The company account has been created successfully");



                }
                catch (Exception )
                {

                    if (user != null)
                    {
                        await userManager.DeleteAsync(user);
                    }

                    return ("500", "Something went wrong while processing your request. Please try again.");
                }
            });
            
        }
        public async Task<(string StatusCode, LoginResponseDto)> UserLogin(LoginDto InsertUser)
        {
            LoginResponseDto loginResponse = new LoginResponseDto();
            try
            {

                var user = await userManager.Users.Include(u => u.RefreshTokens)
                    .FirstOrDefaultAsync(e => e.Email == InsertUser.email);

                if (user == null)
                {
                    loginResponse.message = "Invalid email or password";
                    return ("400", loginResponse); 
                }

                var passwordExists = await signInManager.CheckPasswordSignInAsync(user, InsertUser.password, true);

                if (passwordExists.IsLockedOut)
                {
                    loginResponse.message = "You have exceeded the maximum number of login attempts. Try again in 10 minutes . ";
                    return ("400", loginResponse);
                }

                if (!passwordExists.Succeeded)
                {
                    loginResponse.message = "Invalid email or password";
                    return ("400", loginResponse);
                }

                if (!string.Equals(InsertUser.userType, user.Role.ToString(), StringComparison.OrdinalIgnoreCase))
                {
                    loginResponse.message = "You are trying to log in with a wrong user type .";
                    return ("400", loginResponse);
                }

                var token = await GenerateAccessTokenAsync(user);
                loginResponse.token = token;
                loginResponse.isAuthenticated= true;
                loginResponse.message = "User authenticated";

                if ( user.RefreshTokens.Any(t=>t.IsActive))
                {
                    var refreshTokenModel = user.RefreshTokens.FirstOrDefault(RT=>RT.IsActive);
                    loginResponse.refreshToken = refreshTokenModel.Token;
                    loginResponse.refreshTokenexpiredAt = refreshTokenModel.ExpireOn;
                   
                }
                else
                {
                    var refreshTokenModel = GenerateRefreshToken();
                    loginResponse.refreshToken = refreshTokenModel.Token;
                    loginResponse.refreshTokenexpiredAt =DateTime.SpecifyKind( refreshTokenModel.ExpireOn , DateTimeKind.Utc);
                    user.RefreshTokens.Add(refreshTokenModel);
                    var result =   await   userManager.UpdateAsync(user);
                    if (!result.Succeeded)
                        throw new Exception();
                    
                }

                
                return ("200", loginResponse);
            }
            catch (Exception )
            {
                loginResponse.message = "Something went wrong while processing your request. Please try again.";
                return ("500", loginResponse);
            }
        }
        public async Task<(string StatusCode, LoginResponseDto)> setTokens(string refreshToken)
        {
            LoginResponseDto loginResponse = new LoginResponseDto();
            try
            {

                var user = await userManager.Users
                    .Include(e=>e.RefreshTokens)
                    .FirstOrDefaultAsync(
                    e => e.RefreshTokens.Any(RT => RT.Token == refreshToken)
                    );

                if (user == null)
                {
                    loginResponse.message = "Authentication required";
                    return ("401", loginResponse);
                }
               
                var refreshTokenModelExisting = user.RefreshTokens.Single(r=>r.Token == refreshToken); 
                if(refreshTokenModelExisting == null ||!refreshTokenModelExisting.IsActive)
                {
                    loginResponse.message = "Authentication required";
                    return ("401", loginResponse);
                }
                var token = await GenerateAccessTokenAsync(user);
                loginResponse.token = token;
                loginResponse.isAuthenticated = true;
                loginResponse.message = "User authenticated";

                refreshTokenModelExisting.RevokeOn = DateTime.UtcNow;

                var refreshTokenModel = GenerateRefreshToken();
                loginResponse.refreshToken = refreshTokenModel.Token;
                loginResponse.refreshTokenexpiredAt = refreshTokenModel.ExpireOn;
                user.RefreshTokens.Add(refreshTokenModel);
                var result = await userManager.UpdateAsync(user);
                if (!result.Succeeded)
                    throw new Exception("Refresh token update failed");

                
                return ("200", loginResponse);
            }
            catch (Exception )
            {
                loginResponse.message = "Something went wrong while processing your request. Please try again.";
                return ("500", loginResponse);
            }
        }
        public async Task<bool> SetRevokedToken(string refreshToken)
        {
            try
            {
                var user = await userManager.Users
                    .Include(e => e.RefreshTokens)
                    .FirstOrDefaultAsync(
                       e => e.RefreshTokens.Any(RT => RT.Token == refreshToken)
                       );
                if (user == null)
                    return false;

                var refreshTokenModelExisting = user.RefreshTokens.FirstOrDefault(r => r.Token == refreshToken);
                if (refreshTokenModelExisting == null || !refreshTokenModelExisting.IsActive)
                    return false;

                refreshTokenModelExisting.RevokeOn = DateTime.UtcNow;
                await userManager.UpdateAsync(user);
                return true;
            }
            catch (Exception )
            {
                return false;

            }

        }
        public async Task<(string StatusCode, string Message)> ForgetPassword(ForgetPasswordDto dto)
        {
            try
            {
                var user = await userManager.FindByEmailAsync(dto.email);
                if (user == null)
                    return ("400","No user found with this email");

                var token = await userManager.GeneratePasswordResetTokenAsync(user);
                var encodedToken = System.Web.HttpUtility.UrlEncode(token);

                var resetLink = $"https://proj-intership.vercel.app/resetPassword?email={dto.email}&token={encodedToken}";

                var htmlMessage = $@"
<h2>Hi 👋</h2>

<p>We received a request to reset your password for your <b>InternWay</b> account.</p>

<p>If this was you, click the button below:</p>

<br/>

<a href='{resetLink}' 
   style='background-color:#4F46E5;color:white;padding:12px 20px;
   text-decoration:none;border-radius:8px;'>
   Reset Password
</a>

<br/><br/>

<p>If you didn’t request this, ignore this email.</p>

<hr/>

<p style='font-size:12px;color:gray;'>InternWay Team 💙</p>
"
                ;

                await emailSender.SendEmailAsync(
                    dto.email,
                    "Reset Password - InternWay",
                    htmlMessage
                );
               
                return ("200" , "Password reset link has been sent to your email.");
            }
            catch (Exception )
            {
                return ("500", "Something went wrong while processing your request. Please try again.");
            }
        }
        public async Task<(string StatusCode, object Message)> ResetPassword(ResetPasswordDto dto)
        {
            try
            {
                var user = await userManager.FindByEmailAsync(dto.email);
                if (user == null)
                    return ("400",new { ErrorMessage ="User not found" });

                var decodedToken = System.Web.HttpUtility.UrlDecode(dto.token);

                var result = await userManager.ResetPasswordAsync(user, decodedToken, dto.newPassword);
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(e => new { ErrorDescription = e.Description });
                    return ("400" ,new {Errors = errors });
                }

                return ("200" , new { Message = "Password has been reset successfully." });
            }
            catch (Exception )
            {
                return ("500",  new { ErrorMessage = "Something went wrong while processing your request. Please try again." });
            }
        }


    }
}


