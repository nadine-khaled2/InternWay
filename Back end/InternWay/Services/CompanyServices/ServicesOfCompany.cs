using CloudinaryDotNet.Actions;
using InternWay.DTOs;
using InternWay.DTOs.AIModels;
using InternWay.DTOs.CompanyModels;
using InternWay.DTOs.StudentModels;
using InternWay.IServices;
using InternWay.Models.auth_schema;
using InternWay.Models.company_schema;
using InternWay.Models.student_schema;
using InternWay.Services.Share;
using InternWay.Services.StudentServices;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using static InternWay.Models.company_schema.Application;
using static InternWay.Models.company_schema.Internship;
using static System.Net.Mime.MediaTypeNames;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace InternWay.Services.CompanyServices
{
    public class ServicesOfCompany : IServicesOfCompany
    {
        private readonly InternShipWayDB internShipWay;
        private readonly CloudinaryService cloudinary;
        private readonly UserManager<User> userManager;
        private readonly HttpClient httpClient;
        private readonly ServicesExternalAi servicesExternalAi;
        private readonly ServicesRelationsOfCompany services;
        private readonly INotificationService _notificationService;


        public ServicesOfCompany(InternShipWayDB internShipWay,
            CloudinaryService cloudinary,
            UserManager<User> userManager,
            HttpClient httpClient,
            ServicesExternalAi servicesExternalAi,
            ServicesRelationsOfCompany services,
            INotificationService notificationService
            )
        {
            this.internShipWay = internShipWay;
            this.cloudinary = cloudinary;
            this.userManager = userManager;
            this.httpClient = httpClient;
            this.servicesExternalAi = servicesExternalAi;
            this.services = services;
            _notificationService = notificationService;
        }
        //
        public async Task<(string Message, int StatusCode)> AddIntern(NewInternshipDto NewIntern, int userId)
        {
            await using var transaction = await internShipWay.Database.BeginTransactionAsync();

            try
            {
                var company = await internShipWay.Companies
                    .Include(e => e.User)
                    .FirstOrDefaultAsync(e => e.user_id == userId);
                if (company == null)
                {
                    await transaction.RollbackAsync();
                    return ("User Unauthorized ", 401);
                }

                if (NewIntern == null)
                {
                    await transaction.RollbackAsync();
                    return (" Please insert data for your internship. ", 400);
                }

                if (string.Equals(NewIntern.baidStatus?.Trim(), "Paid", StringComparison.OrdinalIgnoreCase)
                    && NewIntern.priceInternship <= 0)
                {
                    await transaction.RollbackAsync();
                    return (" Internship price is required. ", 400);
                }

                if (string.Equals(NewIntern.baidStatus?.Trim(), "Unpaid", StringComparison.OrdinalIgnoreCase)
                  && NewIntern.priceInternship > 0)
                {
                    await transaction.RollbackAsync();
                    return (" No price of this internship. ", 400);
                }

                if (!DateOnly.TryParseExact(NewIntern.applicationDeadline
                    , new[] { "MM/dd/yyyy", "MM-dd-yyyy", "yyyy-MM-dd", "yyyy/MM/dd" }
                    , CultureInfo.InvariantCulture
                    , DateTimeStyles.None
                    , out var deadLine))
                {
                    await transaction.RollbackAsync();

                    return (" Invalid date format .", 400);
                }
                if (!Enum.TryParse<Location_Type>(NewIntern.workType, true, out var locationType))
                {
                    await transaction.RollbackAsync();
                    return ("Invalid work type", 400);
                }

                if (!Enum.TryParse<Baid_Status>(NewIntern.baidStatus, true, out var paidStatus))
                {
                    await transaction.RollbackAsync();
                    return ("Invalid paid status", 400);
                }

                var intern = new Internship()
                {
                    company_id = company.company_id,
                    title = NewIntern.internTitle,
                    description = NewIntern.internDescription,
                    requirements = string.Join('\n', NewIntern.requirements),
                    duration_months = NewIntern.duration,
                    location_type = locationType,
                    location = NewIntern.location,
                    application_deadline = deadLine,
                    paid_status = paidStatus,
                    priceInternship = NewIntern.priceInternship,

                };

                await internShipWay.Internships.AddAsync(intern);

                if (NewIntern.RequiredSkills == null || !NewIntern.RequiredSkills.Any())
                {
                    await transaction.RollbackAsync();
                    return ("Please add at least one required skill.", 400);
                }

                await internShipWay.SaveChangesAsync();

                var result1 = await services.AddSkills(NewIntern.RequiredSkills);
                if (result1.statusCode == 500)
                    throw new Exception("Failed to add skills of internship");

                await UpdateSkillsOfintern(intern.Internship_Id, result1.Item1);

                await transaction.CommitAsync();

                return ("Internship posted successfully.", 200);

            }
            catch (Exception)
            {

                await transaction.RollbackAsync();

                return ("Something went wrong while processing your request. Please try again.", 500);
            }


        }
        public async Task<(int StatusCode, string message, AllDataForCompanyDto?)> getDataOfCompany(int UserId)
        {
            try
            {
                List<InternshipDataDto> interns = new();
                List<ApplicantDataDto> recentApplicants = new();
                int numTotalApplicant = 0;
                int numAcceptedApplicant = 0;

                var company = await internShipWay.Companies
                      .Where(e => e.user_id == UserId)
                      .Include(e => e.internships)
                      .ThenInclude(e => e.applications)
                      .ThenInclude(e => e.Student)
                      .ThenInclude(e => e.User)
                      .FirstOrDefaultAsync();

                if (company == null)
                    return (404, "Company not found . ", null);

                var activeIntern = company.internships.Where(i => !i.IsClose).ToList();

                foreach (var intern in activeIntern ?? new List<Internship>())
                {
                    var internship = new InternshipDataDto()
                    {
                        internshipId = intern.Internship_Id,
                        title = intern.title,
                        locationType = intern.location_type.ToString(),
                        location = intern.location?.Split(',')[0].Trim() ?? string.Empty,
                        paidStatus = intern.paid_status.ToString(),
                        numberOfApplicants = intern.applications?.Count() ?? 0
                    };

                    interns.Add(internship);
                   
                }
             
                numTotalApplicant = company.internships
   
                    .SelectMany(i => i.applications ?? new List<Models.company_schema.Application>())
   
                    .Count();

                numAcceptedApplicant = company.internships
                  
                    .SelectMany(i => i.applications ?? new List<Models.company_schema.Application>())
                  
                    .Count(a => a.status == Status_Application.Accepted);
              
                recentApplicants = company.internships

                   .SelectMany(i => i.applications ?? Enumerable.Empty<Models.company_schema.Application>())

                   .OrderByDescending(a => a.applied_at)

                   .Select(appli => new ApplicantDataDto

                   {

                       Applicant_Id = appli.Application_Id,

                       internId = appli.Internship_Id,

                       Applicant_Name = appli.Student?.User?.Full_Name ?? string.Empty,

                       internTitle = appli.internship?.title ?? string.Empty,

                       applied_at = GetTimeAgo(appli.applied_at),

                       status = appli.status.ToString()

                   })

                   .ToList();

                AllDataForCompanyDto CompanyData = new AllDataForCompanyDto()
                {
                    NumberActiveInterns = !interns.Any() ? 0 : interns.Count(),
                    NumberTotalApplicants = numTotalApplicant,
                    NumberHiredInterns = numAcceptedApplicant,
                    ActiveInterns = interns,
                    RecentApplicants = recentApplicants,

                };
                return (200, string.Empty, CompanyData);
            }
            catch (Exception)
            {
                return (500, "Something went wrong while processing your request. Please try again.", null);

            }

        }
        public async Task AddSkillsOfintern(int internId, List<int> NewSkillId)
        {
            var RelationsToAdd = NewSkillId
                .Select(id => new Internship_Skills() { Internship_Id = internId, Skill_Id = id })
                .ToList();
            if (RelationsToAdd.Any())
                await internShipWay.Internship_Skills.AddRangeAsync(RelationsToAdd);

        }
        public async Task DeleteSkillsOfintern(int internId, List<int> DeleteSkillId)
        {
            var RelationsToDelete = await internShipWay.Internship_Skills
                 .Where(e => e.Internship_Id == internId && DeleteSkillId.Contains(e.Skill_Id))
                 .ToListAsync();

            if (RelationsToDelete.Any())
                internShipWay.Internship_Skills.RemoveRange(RelationsToDelete);

        }
        public async Task UpdateSkillsOfintern(int internId, List<int> SkillId)
        {
            var existingSkillIds = await internShipWay.Internship_Skills
                             .Where(e => e.Internship_Id == internId)
                             .Select(e => e.Skill_Id).ToListAsync();

            var addSkillIds = SkillId.Except(existingSkillIds).ToList();

            var deleteSkillIds = existingSkillIds.Except(SkillId).ToList();

            if (addSkillIds.Any())
                await AddSkillsOfintern(internId, addSkillIds);

            if (deleteSkillIds.Any())
                await DeleteSkillsOfintern(internId, deleteSkillIds);


            await internShipWay.SaveChangesAsync();


        }
        public async Task<(DetailsOfInternDtoForCompany?, int statusCode, string message)> ViewDetailsOfInternForcompany(int internId, int userId)
        {
            try
            {
                var Company = await internShipWay.Companies
                  .Include(e => e.internships)
                  .ThenInclude(i => i.skills)
                  .Include(e => e.internships)
                   .ThenInclude(i => i.applications)
                  .FirstOrDefaultAsync(e => e.user_id == userId);

                if (Company == null)
                    return (null, 401, "User Unauthorized ");


                var intern = Company.internships
                 .FirstOrDefault(i => i.Internship_Id == internId);
                if (intern == null)
                    return (null, 404, " Not found internship");

                List<string> skills = intern.skills?
                    .Select(s => s.Skill_Name).ToList() ?? new List<string>();

                List<string> requirements = intern.requirements?
                    .Split('\n', StringSplitOptions.RemoveEmptyEntries)
                    .Select(r => r.Trim())
                    .ToList() ?? new List<string>();

                var locationPartsOfIntern = intern.location?.Split(',')
                    .ToList() ?? new List<string>();
                var CityOfIntern = locationPartsOfIntern?
                    .Count() > 0 ? locationPartsOfIntern[0]?.Trim() : null;
                var CountryOfIntern = locationPartsOfIntern?
                    .Count() > 1 ? locationPartsOfIntern[1]?.Trim() : null;

                var locationPartsOfCompany = Company.location?
                    .Split(',').ToList() ?? new List<string>();
                var CityOfCompany = locationPartsOfCompany?
                    .Count() > 0 ? locationPartsOfCompany[0]?.Trim() : null;
                var CountryOfCompany = locationPartsOfCompany?
                    .Count() > 1 ? locationPartsOfCompany[1]?.Trim() : null;

                var DateCreatedAt = DateTime.SpecifyKind(intern.Create_at, DateTimeKind.Utc)
                    .ToLocalTime().ToString("MMM d,yyyy", CultureInfo.InvariantCulture);

                string? DateUpdateAt = null;
                if (intern.Update_At != null)
                {
                    DateUpdateAt = DateTime.SpecifyKind(intern.Update_At.Value, DateTimeKind.Utc)
                   .ToLocalTime().ToString("MMM d,yyyy", CultureInfo.InvariantCulture);
                }

                var DataOfIntern = new DetailsOfInternDtoForCompany()
                {
                    internId = intern.Internship_Id
                    ,
                    title = intern.title
                    ,
                    description = intern.description
                    ,
                    requirements = requirements
                    ,
                    skills = skills
                    ,
                    duration = intern.duration_months
                    ,
                    locationType = intern.location_type.ToString()
                    ,
                    Internship_City = CityOfIntern
                    ,
                    Internship_Country = CountryOfIntern
                    ,
                    DeadlineDate = intern.application_deadline.ToString("MMM d,yyyy", CultureInfo.InvariantCulture)
                    ,
                    CreatedAt = DateCreatedAt
                    ,
                    updateAt = intern.Update_At != null ? DateUpdateAt : null
                    ,
                    IsPaid = intern.paid_status == Baid_Status.Paid ? true : false
                    ,
                    price = intern.priceInternship
                    ,
                    status = intern.IsClose ? "Close" : "Open"
                    ,
                    IsOpen = !intern.IsClose ? true : false
                    ,
                    applicationsCount = intern.applications?.Count() ?? 0
                };


                return (DataOfIntern, 200, string.Empty);
            }
            catch (Exception)
            {
                return (null, 500, "Something went wrong while processing your request. Please try again.");
            }
        }
        //
        public async Task<(List<DataOfInternshipDto>?, int statusCode)> GetAllInternshipForCompany(int UserId)
        {
            try
            {
                var Company = await internShipWay.Companies
                   .Include(e => e.internships)
                   .ThenInclude(i => i.skills)
                   .Include(e => e.internships)
                    .ThenInclude(i => i.applications)
                   .FirstOrDefaultAsync(e => e.user_id == UserId);

                if (Company == null)
                    return (null, 401);

                var internships = Company.internships?.Select(e =>
                new DataOfInternshipDto()
                {
                    Internship_Id = e.Internship_Id,
                    title = e.title,
                    locationType = e.location_type.ToString(),
                    city = !string.IsNullOrEmpty(e.location) ? e.location.Split(',')[0].Trim() : null,
                    paidStatus = e.paid_status.ToString(),
                    price = e.priceInternship.ToString(),
                    status = e.status.ToString(),
                    deadline = e.application_deadline.ToString("MMM d, yyyy", CultureInfo.InvariantCulture),
                    applicationsCount = e.applications?.Count() ?? 0,

                }).ToList();

                if (internships?.Count() <= 0)
                    return (null, 404);

                return (internships, 200);
            }
            catch (Exception)
            {
                return (null, 500);
            }

        }
        public async Task<(List<DataForApplicantDto>?, int statusCode, string message)> ViewAllApplicantsForCompany(int userId)
        {
            try
            {
                var company = await internShipWay.Companies
                    .Include(e => e.internships)
                    .ThenInclude(e => e.applications)
                    .ThenInclude(a => a.Student)
                    .ThenInclude(s => s.User)
                    .FirstOrDefaultAsync(e => e.user_id == userId);
                if (company == null)
                    return (null, 401, " User Unauthorized ");

                if (company.internships == null || !company.internships.Any())
                    return (null, 404, " Not found internships of company");

                var internships = company.internships.ToList();

                var ApplicantsOfCompany = internships.Where(e => e.applications != null && e.applications.Any())
                    .SelectMany(e => e.applications.Select(a => new
                    {
                        Internship = e,
                        Application = a
                    }))

                    .OrderByDescending(x => x.Application.applied_at)
                    .Select(a =>
                    {

                        return new DataForApplicantDto()
                        {
                            applicantId = a.Application.Application_Id,
                            internId = a.Application.Internship_Id,
                            applicantName = a.Application.Student?.User?.Full_Name ?? string.Empty,
                            email = a.Application.Student?.User?.Email ?? string.Empty,
                            phone = a.Application.Student?.User?.PhoneNumber ?? string.Empty,
                            internTitle = a.Internship.title,
                            university = a.Application.Student?.University ?? string.Empty,
                            major = a.Application.Student?.Major ?? string.Empty,
                            status = a.Application.status.ToString(),
                            appliedAt = GetTimeAgo(a.Application.applied_at)

                        };
                    }).ToList();

                return (ApplicantsOfCompany, 200, "Applicants are retrieved successfully");
            }

            catch (Exception)
            {
                return (null, 500, "Something went wrong while processing your request. Please try again.");
            }
        }
        public async Task<(string message, int statuscode)> RejectApplicant(int internshipId, int UserId, int applicantId)
        {
            using var transaction = await internShipWay.Database.BeginTransactionAsync();

            try
            {

                var company = await internShipWay.Companies
                  .Where(e => e.user_id == UserId)
                  .Include(e => e.internships)
                  .ThenInclude(e => e.applications)
                  .FirstOrDefaultAsync();

                if (company == null)
                {
                    await transaction.RollbackAsync();
                    return ("User Unauthorized ", 401);
                }

                var intern = company.internships
                    .FirstOrDefault(i => i.Internship_Id == internshipId);
                if (intern == null)
                {
                    await transaction.RollbackAsync();
                    return (" Not found internship", 404);
                }

                var applicant = intern.applications
                    .FirstOrDefault(a => a.Application_Id == applicantId);
                if (applicant == null)
                {
                    await transaction.RollbackAsync();
                    return (" Not found applicant", 404);
                }

                if (applicant.status != Status_Application.Pending)
                {
                    if (applicant.status == Status_Application.Accepted)
                    {
                        await transaction.RollbackAsync();
                        return ("This applicant has already been accepted for this internship previously. No further action is required. "
                            , 404);
                    }
                    else
                    {
                        await transaction.RollbackAsync();
                        return ("This applicant has already been rejected for this internship previously. No further action can be taken. "
                            , 404);
                    }
                }
                applicant.status = Status_Application.Rejected;

                await internShipWay.SaveChangesAsync();
                await transaction.CommitAsync();

                var student = await internShipWay.Students.FirstOrDefaultAsync(s => s.Student_Id == applicant.Student_Id);
                if (student != null)
                {
                    await _notificationService.CreateAndSendNotificationAsync(
                        userId: student.user_id,
                        title: "Application Status Update",
                        message: $"Unfortunately, your application for '{intern.title}' at {company.company_name} was not successful.",
                        type: "StudentApplication",
                        relatedEntityId: intern.Internship_Id
                    );
                }
                return ("Rejected successfully", 200);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                return ("Something went wrong while processing your request. Please try again.", 500);
            }

        }
        public async Task<(string message, int statuscode)> AcceptApplicant(int internshipId, int UserId, int applicantId)
        {
            using var transaction = await internShipWay.Database.BeginTransactionAsync();
            try
            {

                var company = await internShipWay.Companies
                  .Where(e => e.user_id == UserId)
                  .Include(e => e.internships)
                  .ThenInclude(e => e.applications)
                  .FirstOrDefaultAsync();

                if (company == null)
                {
                    await transaction.RollbackAsync();
                    return ("User Unauthorized ", 401);
                }

                var intern = company.internships
                    .FirstOrDefault(i => i.Internship_Id == internshipId);
                if (intern == null)
                {
                    await transaction.RollbackAsync();
                    return (" Not found internship", 404);
                }

                var applicant = intern.applications
                    .FirstOrDefault(a => a.Application_Id == applicantId);
                if (applicant == null)
                {
                    await transaction.RollbackAsync();
                    return (" Not found applicant", 404);
                }

                if (applicant.status != Status_Application.Pending)
                {
                    if (applicant.status == Status_Application.Accepted)
                    {
                        await transaction.RollbackAsync();
                        return ("This applicant has already been accepted for this internship previously. No further action is required. "
                            , 404);
                    }
                    else
                    {
                        await transaction.RollbackAsync();
                        return ("This applicant has already been rejected for this internship previously. No further action can be taken. "
                            , 404);
                    }
                }


                applicant.status = Status_Application.Accepted;


                await internShipWay.SaveChangesAsync();

                await transaction.CommitAsync();

                var student = await internShipWay.Students.FirstOrDefaultAsync(s => s.Student_Id == applicant.Student_Id);
                if (student != null)
                {
                    await _notificationService.CreateAndSendNotificationAsync(
                        userId: student.user_id,
                        title: "Application Accepted! 🎉",
                        message: $"Congratulations! Your application for '{intern.title}' at {company.company_name} has been accepted.",
                        type: "StudentApplication",
                        relatedEntityId: intern.Internship_Id
                    );
                }

                return ("Accepted successfully", 200);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                return ("Something went wrong while processing your request. Please try again.", 500);
            }

        }
        public async Task<(Stream? stream, string message, string fileName, string contentType, int statuscode)> DownloadCV(int UserId, int applicantId)
        {
            using var transaction = await internShipWay.Database.BeginTransactionAsync();
            try
            {
                var applicant = await internShipWay.Applications
                    .Where(a => a.Application_Id == applicantId)
                    .Include(a => a.Student)
                    .Include(e => e.internship)
                    .ThenInclude(a => a.company)
                    .FirstOrDefaultAsync();

                if (applicant == null)
                {
                    await transaction.RollbackAsync();
                    return (null, " Not found Applicant", string.Empty, string.Empty, 404);
                }

                if (applicant.internship?.company?.user_id != UserId)
                {
                    await transaction.RollbackAsync();
                    return (null, " Not found this the applicant ", string.Empty, string.Empty, 403);
                }

                if (applicant.Student == null
                    || applicant.Student.CvPublicID == null
                    || applicant.Student.CvFileName == null)
                {
                    await transaction.RollbackAsync();
                    return (null, "Not found applicant", string.Empty, string.Empty, 404);
                }

                var result = await cloudinary.DownloadCv(applicant.Student.CvPublicID, applicant.Student.CvFileName);
                if (result.statuscode != 200)
                    throw new Exception(result.message);

                var streamFile = await httpClient.GetStreamAsync(result.message);
                var fileName = applicant.Student.CvFileName;
                var extension = Path.GetExtension(fileName).ToLower();

                string contentType = extension switch
                {
                    ".pdf" => "application/pdf",
                    ".docx" => "application/vnd.openxmlformatsofficedocument.wordprocessingml.document",
                    _ => "application/octet-stream"

                };


                await transaction.CommitAsync();

                return (streamFile, string.Empty, fileName, contentType, 200);


            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                return (null, "Something went wrong while processing your request. Please try again.", string.Empty, string.Empty, 500);
            }
        }
        //
        public async Task<(ProfileOfCompanyDto?, int StatusCode)> getprofileOfCompany(int userId)
        {
            try
            {

                var User = await userManager.Users
                    .Include(e => e.Company)
                    .FirstOrDefaultAsync(e => e.Id == userId);
                if (User == null || User.Company == null)
                    return (null, 404);

                var LocationParts = User.Company.location?.Split(',') ?? new string[0];
                var city = LocationParts.Length > 0 ? LocationParts[0] : null;
                var country = LocationParts.Length > 1 ? LocationParts[1] : null;

                var DataOfProfile = new ProfileOfCompanyDto()
                {
                    companyName = User.Company.company_name,
                    email = User.Email,
                    phoneNumber = User.PhoneNumber,
                    industry = User.Company.industry,
                    officeAddress = User.Company.officeAddress,
                    city = city?.Trim(),
                    country = country?.Trim(),
                    foundedYear = User.Company.foundedYear,
                    description = User.Company.description,
                    website = User.Company.website,
                    LinkedIn = User.Company.LinkedIn,
                    Twitter = User.Company.Twitter,
                    Facebook = User.Company.Facebook,
                    Instagram = User.Company.Instagram
                };
                return (DataOfProfile, 200);

            }

            catch (Exception)
            {
                return (null, 500);
            }

        }
        //
        public async Task<(ProfileOfCompanyDto?, int statusCode)> EditCompany(EditCompanyDto Editedcompany, int userId)
        {
            using var transaction = await internShipWay.Database.BeginTransactionAsync();
            try
            {
                var company = await internShipWay.Companies
                    .Include(x => x.User)
                    .FirstOrDefaultAsync(e => e.user_id == userId);

                if (company == null || company.User == null)
                    return (null, 404);

                var ExistingCompany = await userManager.FindByEmailAsync(Editedcompany.email);
                if (ExistingCompany != null && ExistingCompany.Id != userId)
                    return (null, 409);

                var locationParts = new List<string>()
                {
                    Editedcompany.city ,
                    Editedcompany.country
                };


                company.User.Full_Name = Editedcompany.companyName;
                company.User.Email = Editedcompany.email;
                company.User.UserName = Editedcompany.email;
                company.User.NormalizedEmail = Editedcompany.email.ToUpper();
                company.User.NormalizedUserName = Editedcompany.email.ToUpper();
                company.User.PhoneNumber = Editedcompany.phoneNumber;
                company.User.Update_at = DateTime.UtcNow;

                company.company_name = Editedcompany.companyName;
                company.industry = Editedcompany.industry;
                company.description = Editedcompany.description;
                company.officeAddress = Editedcompany.officeAddress;
                company.location = string.Join(',', locationParts);
                company.foundedYear = Editedcompany.foundedYear;
                company.website = Editedcompany.website;
                company.Facebook = Editedcompany.Facebook;
                company.Twitter = Editedcompany.Twitter;
                company.Instagram = Editedcompany.Instagram;
                company.LinkedIn = Editedcompany.LinkedIn;



                await internShipWay.SaveChangesAsync();
                await transaction.CommitAsync();

                var DataOfProfile = new ProfileOfCompanyDto()
                {
                    companyName = company.company_name,
                    email = company.User.Email,
                    phoneNumber = company.User.PhoneNumber,
                    industry = company.industry,
                    officeAddress = company.officeAddress,
                    city = locationParts[0]?.Trim(),
                    country = locationParts[1]?.Trim(),
                    foundedYear = company.foundedYear,
                    description = company.description,
                    website = company.website,
                    LinkedIn = company.LinkedIn,
                    Twitter = company.Twitter,
                    Facebook = company.Facebook,
                    Instagram = company.Instagram
                };

                return (DataOfProfile, 200);

            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return (null, 500);

            }

        }
        //
        public async Task<(int statusCode, string message)> CloseIntern(int internshipId, int userId)
        {
            using var transaction = await internShipWay.Database.BeginTransactionAsync();
            try
            {
                var company = await internShipWay.Companies
                  .Include(c => c.internships)
                  .FirstOrDefaultAsync(e => e.user_id == userId);
                if (company == null)
                {
                    await transaction.RollbackAsync();
                    return (401, "User Unauthorized");
                }

                var intern = company.internships
                    .FirstOrDefault(i => i.Internship_Id == internshipId);
                if (intern == null)
                {
                    await transaction.RollbackAsync();
                    return (404, " Not found internship");
                }

                if (intern.status == Status.Closed)
                {
                    await transaction.RollbackAsync();
                    return (400, " This internship is already close and cannot be modified.");
                }
                intern.Update_At = DateTime.UtcNow;
                intern.Revoked_At = DateTime.UtcNow;
                intern.status = Status.Closed;

                await internShipWay.SaveChangesAsync();

                await transaction.CommitAsync();

                return (200, "Closed successfully");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                return (500, "Something went wrong while processing your request. Please try again.");
            }
        }
        //
        public async Task<(int statusCode, string message)> DeleteIntern(int internshipId, int userId)
        {
            using var transaction = await internShipWay.Database.BeginTransactionAsync();
            try
            {
                var company = await internShipWay.Companies
                 .Include(c => c.internships)
                 .ThenInclude(d => d.applications)
                 .Include(c => c.internships)
                 .ThenInclude(i => i.Internship_Skills)
                 .FirstOrDefaultAsync(e => e.user_id == userId);
                if (company == null)
                {
                    await transaction.RollbackAsync();
                    return (401, "User Unauthorized");
                }

                var intern = company.internships
                            .FirstOrDefault(i => i.Internship_Id == internshipId);
                if (intern == null)
                {
                    await transaction.RollbackAsync();
                    return (404, " Not found internship");
                }

                if (intern.Internship_Skills != null && intern.Internship_Skills.Any())
                {
                    var InternSkills = intern.Internship_Skills
                    .Where(e => e.Internship_Id == intern.Internship_Id).ToList();

                    internShipWay.Internship_Skills.RemoveRange(InternSkills);
                }

                if (intern.applications != null && intern.applications.Any())
                {
                    var Applications = intern.applications
                    .Where(e => e.Internship_Id == intern.Internship_Id).ToList();

                    internShipWay.Applications.RemoveRange(Applications);
                }

                internShipWay.Internships.Remove(intern);

                await internShipWay.SaveChangesAsync();

                await transaction.CommitAsync();

                return (200, "Delete successfully");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                return (500, "Something went wrong while processing your request. Please try again.");
            }
        }
        //
        public async Task<(EditInternshipDto?, int statusCode)> GetDataForEditingIntern(int internId, int userId)
        {
            try
            {

                var company = await internShipWay.Companies
                    .Include(e => e.User)
                    .Include(c => c.internships)
                    .ThenInclude(i => i.skills)
                    .FirstOrDefaultAsync(e => e.user_id == userId);
                if (company == null)
                    return (null, 401);

                var intern = company.internships
                    .FirstOrDefault(i => i.Internship_Id == internId);
                if (intern == null)
                    return (null, 404);

                var requiredSkills = intern.skills?.Select(s => s.Skill_Name).ToList() ?? new List<string>();

                var dataOfintern = new EditInternshipDto()
                {
                    internId = intern.Internship_Id
                    ,
                    internTitle = intern.title
                    ,
                    internDescription = intern.description
                    ,
                    requirements = intern.requirements?.Split('\n').ToList() ?? new List<string>()
                    ,
                    workType = intern.location_type.ToString()
                    ,
                    location = !string.IsNullOrEmpty(intern.location) ? intern.location.Split(',')[0].Trim() : null
                    ,
                    application_deadline = intern.application_deadline
                    .ToString("dd/MM/yyyy", CultureInfo.InvariantCulture)
                    ,
                    duration = intern.duration_months
                    ,
                    BaidStatus = intern.paid_status.ToString()
                    ,
                    IsPaid = intern.paid_status == Baid_Status.Paid ? true : false
                    ,
                    priceInternship = intern.priceInternship
                    ,
                    RequiredSkills = requiredSkills

                };
                return (dataOfintern, 200);
            }
            catch (Exception)
            {
                return (null, 500);
            }
        }
        //
        public async Task<(DataOfInternshipDto?, int statusCode, string message)> EditIntern(int userId, RequestEditedInternshipDto EditingInternship)
        {
            await using var transaction = await internShipWay.Database.BeginTransactionAsync();
            try
            {
                var Company = await internShipWay.Companies
                    .Include(e => e.User)
                    .Include(e => e.internships)
                    .ThenInclude(i => i.skills)
                    .Include(e => e.internships)
                     .ThenInclude(i => i.applications)
                    .FirstOrDefaultAsync(e => e.user_id == userId);

                if (Company == null)
                    return (null, 401, "User Unauthorized");

                var intern = Company.internships
                    .FirstOrDefault(i => i.Internship_Id == EditingInternship.internId);
                if (intern == null)
                    return (null, 404, " Not found internship");

                if (string.Equals(EditingInternship.baidStatus?.Trim(), "Paid", StringComparison.OrdinalIgnoreCase)
                    && EditingInternship.priceInternship <= 0)
                    return (null, 400, " Internship price is required. ");

                if (string.Equals(EditingInternship.baidStatus?.Trim(), "Unpaid", StringComparison.OrdinalIgnoreCase)
                   && EditingInternship.priceInternship > 0)
                    return (null, 400, " No price of this internship. ");

                if (!DateOnly.TryParseExact(EditingInternship.applicationDeadline
                   , new[] { "MM/dd/yyyy", "MM-dd-yyyy", "yyyy-MM-dd", "yyyy/MM/dd", "dd/MM/yyyy", "dd-MM-yyyy" }, CultureInfo.InvariantCulture
                   , DateTimeStyles.None
                   , out var deadLine))
                {
                    return (null, 400, "Invalid date format .");
                }

                if (!Enum.TryParse<Location_Type>(EditingInternship.workType, true, out var locationType))
                    return (null, 400, "Invalid work type");

                if (!Enum.TryParse<Baid_Status>(EditingInternship.baidStatus, true, out var paidStatus))
                    return (null, 400, "Invalid paid status");

                if (EditingInternship.RequiredSkills == null || !EditingInternship.RequiredSkills.Any())
                    return (null, 400, "Please add at least one required skill");

                intern.title = EditingInternship.internTitle;
                intern.description = EditingInternship.internDescription;
                intern.location = EditingInternship.location ?? string.Empty;
                intern.requirements = string.Join('\n', EditingInternship.requirements);
                intern.duration_months = EditingInternship.duration;
                intern.application_deadline = deadLine;
                intern.location_type = locationType;
                intern.paid_status = paidStatus;
                intern.priceInternship = EditingInternship.priceInternship;
                intern.Update_At = DateTime.UtcNow;

                var result1 = await services.AddSkills(EditingInternship.RequiredSkills);
                if (result1.statusCode == 500)
                    throw new Exception("Failed to add skills of internship");

                await UpdateSkillsOfintern(intern.Internship_Id, result1.Item1);

                await internShipWay.SaveChangesAsync();

                await transaction.CommitAsync();


                return (new DataOfInternshipDto()
                {
                    Internship_Id = intern.Internship_Id,
                    title = intern.title,
                    locationType = intern.location_type.ToString(),
                    city = intern.location,
                    paidStatus = intern.paid_status.ToString(),
                    price = intern.priceInternship.ToString(),
                    status = intern.status.ToString(),
                    deadline = intern.application_deadline.ToString("MMM d, yyyy", CultureInfo.InvariantCulture),
                    applicationsCount = intern.applications?.Count() ?? 0,

                }
                , 200
                , "Updated successfully"
                );

            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return (null, 500, "Something went wrong while processing your request. Please try again.");
            }
        }
        //
        public async Task<(int statusCode, string message)> OpenIntern(OpenInternRequest openRequest, int userId)
        {
            using var transaction = await internShipWay.Database.BeginTransactionAsync();
            try
            {
                var company = await internShipWay.Companies
                    .Include(c => c.internships)
                    .FirstOrDefaultAsync(e => e.user_id == userId);
                if (company == null)
                {
                    await transaction.RollbackAsync();
                    return (401, "User Unauthorized");
                }

                var intern = company.internships
                    .FirstOrDefault(i => i.Internship_Id == openRequest.internshipId);
                if (intern == null)
                {
                    await transaction.RollbackAsync();
                    return (404, " Not found internship");
                }

                if (!intern.IsClose)
                {
                    await transaction.RollbackAsync();
                    return (400, " This internship is already open and cannot be modified.");
                }

                if (intern.Revoked_At != null)
                    intern.Revoked_At = null;

                if (intern.application_deadline < DateOnly.FromDateTime(DateTime.UtcNow))
                {
                    if (string.IsNullOrWhiteSpace(openRequest.deadline))
                    {
                        await transaction.RollbackAsync();
                        return (400, "Deadline of this internship is required ");
                    }

                    if (!DateOnly.TryParseExact(openRequest.deadline
                  , new[] { "MM/dd/yyyy", "MM-dd-yyyy", "yyyy-MM-dd", "yyyy/MM/dd", "dd/MM/yyyy", "dd-MM-yyyy" }
                  , CultureInfo.InvariantCulture
                  , DateTimeStyles.None
                  , out var NewDeadLine))
                    {
                        await transaction.RollbackAsync();

                        return (400, "Invalid date format .");
                    }

                    intern.application_deadline = NewDeadLine;
                }

                if (!string.IsNullOrWhiteSpace(openRequest.deadline))
                {
                    if (!DateOnly.TryParseExact(openRequest.deadline
                  , new[] { "MM/dd/yyyy", "MM-dd-yyyy", "yyyy-MM-dd", "yyyy/MM/dd", "dd/MM/yyyy", "dd-MM-yyyy" }
                  , CultureInfo.InvariantCulture
                  , DateTimeStyles.None
                  , out var NewDeadLine))
                    {
                        await transaction.RollbackAsync();

                        return (400, "Invalid date format .");
                    }

                    intern.application_deadline = NewDeadLine;

                }
              
                intern.Update_At = DateTime.UtcNow;
                intern.status = Status.Open;

                await internShipWay.SaveChangesAsync();

                await transaction.CommitAsync();

                return (200, "Reopen successfully");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                return (500, "Something went wrong while processing your request. Please try again.");
            }
        }
        //
        public async Task<(List<DataForApplicantDto>?, int statusCode, string message)> ViewApplicantsByIntern(int internshipId, int userId)
        {
            try
            {
                var Applicants = await internShipWay.Applications
                    .Where(e => e.Internship_Id == internshipId)
                    .Include(e => e.internship)
                     .ThenInclude(e => e.company)
                    .Include(e => e.Student)
                    .ThenInclude(e => e.User)
                    .ToListAsync();

                var ValidCompany = Applicants.All(e => e.internship.company.user_id == userId);

                if (!ValidCompany)
                    return (null, 404, "This internship does not belong to your company.");

                if (!Applicants.Any())
                    return (null, 404, " Not found applicants of this internship");

                var allApplicantsOfIntern = Applicants.Select(e => {

                    return new DataForApplicantDto()
                    {
                        applicantId = e.Application_Id,
                        internId = e.Internship_Id,
                        applicantName = e.Student?.User?.Full_Name ?? string.Empty,
                        email = e.Student?.User?.Email ?? string.Empty,
                        phone = e.Student?.User?.PhoneNumber ?? string.Empty,
                        internTitle = e.internship?.title ?? string.Empty,
                        university = e.Student?.University ?? string.Empty,
                        major = e.Student?.Major ?? string.Empty,
                        status = e.status.ToString(),
                        appliedAt = GetTimeAgo(e.applied_at)

                    };
                }).ToList();


                return (allApplicantsOfIntern, 200, "Applicants are retrieved successfully");
            }

            catch (Exception)
            {
                return (null, 500, "Something went wrong while processing your request. Please try again.");
            }
        }
        //ok 
        public async Task<(List<MatchScoreForApplicant>?, int statusCode, string message)> GetMatchScoreOfApplicants(int internshipId, int UserId)
        {
            try
            {
                var internship = await internShipWay.Internships
                   .Include(e => e.skills)
                   .Include(e => e.applications)
                     .ThenInclude(e => e.Student)
                        .ThenInclude(s => s.skills)
                   .Include(e => e.applications)
                         .ThenInclude(e => e.Student)
                         .ThenInclude(e => e.Experiences)
                   .Include(e => e.company)
                   .ThenInclude(e => e.User)
                   .FirstOrDefaultAsync(e => e.Internship_Id == internshipId);

                if (internship == null || internship.applications == null || !internship.applications.Any())
                    return (null, 404, " Not found applicants of this internship");
                if (internship.company == null || internship.company.user_id != UserId)
                    return (null, 404, "This internship does not belong to your company.");

                var LocationParts = internship.location?.Split(',').ToList() ?? new List<string>();
                var CityOfInternship = LocationParts.Count() > 0 ? LocationParts[0].Trim() : null;
                var CountryOfInternship = LocationParts.Count() > 1 ? LocationParts[1].Trim() : null;
                var RequiredSkills = internship.skills?.Select(s => s.Skill_Name).ToList() ?? null;
                var InternshipJson = new InternshipDto()
                {
                    InternId = internship.Internship_Id,
                    Title = internship.title,
                    WorkType = internship.location_type.ToString(),
                    CompanyName = internship.company?.company_name ?? null,
                    Location = CityOfInternship,
                    Skills = string.Join(',', RequiredSkills ?? new List<string>()) ?? null,


                };

                var ApplicantsJson = internship.applications?.Select(e => {

                    var parts = e.Student != null && !string.IsNullOrEmpty(e.Student.location) ?
                        e.Student.location.Split(',').ToList() : new List<string>();
                    var city = parts.Count() > 0 ? parts[0].Trim() : null;
                    var country = parts.Count() > 1 ? parts[1].Trim() : null;

                    return new StudentForInternshipJson()
                    {
                        StudentId = e.Application_Id.ToString(),
                        Location = new Location()
                        {
                            city = city,

                            country = country,
                        },
                        SkillS = e.Student?.skills?.Select(s => s.Skill_Name).ToList() ?? null,
                        Experiences = e.Student?.Experiences?
                           .Select(e => new ExperienceDto()
                           {
                               title = e.title,
                               companyName = e.companyName,
                               endDate = e.endDate,
                               startDate = e.startDate
                           }).ToList() ?? null
                    };



                }).ToList() ?? null;

                var request = new InternshipMatchRequest()
                {
                    Internship = InternshipJson,
                    applicants = ApplicantsJson
                };
                var AiResponse = await servicesExternalAi.GetInternshipMatchScores(request);

                if (AiResponse == null || AiResponse.ApplicantsMatches == null || !AiResponse.ApplicantsMatches.Any())
                    return (null, 502, "Failed to retrieve response from AI service.");

                if (!int.TryParse(AiResponse.internId, out int InternshipId))
                    return (null, 400, "Invalid student ID format.");

                if (internship.Internship_Id != InternshipId)
                    return (null, 403, "The internship ID returned by the AI service does not match the requested internship.");

                var MatchScoreModel = AiResponse.ApplicantsMatches
                   .Select(e =>
                   {
                       return new MatchScoreForApplicant()
                       {
                           ApplicantId = e.Id,
                           MatchScore = e.score
                       };
                   }).Where(e => e != null)
                   .Select(e => e!)
                   .ToList();


                return (MatchScoreModel, 200, "Match Score of applicants retrieved successfully.");
            }
            catch (Exception)
            {
                return (null, 500, "Something went wrong while processing your request. Please try again.");
            }

        }
        public static string GetTimeAgo(DateTime dateTime)
        {
            var localDateTime = DateTime.SpecifyKind(dateTime, DateTimeKind.Utc).ToLocalTime();

            var span = DateTime.Now - localDateTime;

            if (span.TotalSeconds < 5)
                return "Just now";

            if (span.TotalSeconds < 60)
                return $"{(int)span.TotalSeconds} seconds ago";

            if (span.TotalMinutes < 60)
                return $"{(int)span.TotalMinutes} minute{((int)span.TotalMinutes > 1 ? "s" : "")} ago";

            if (span.TotalHours < 24)
                return $"{(int)span.TotalHours} hour{((int)span.TotalHours > 1 ? "s" : "")} ago";

            if (span.TotalDays < 7)
                return $"{(int)span.TotalDays} day{((int)span.TotalDays > 1 ? "s" : "")} ago";

            if (span.TotalDays < 30)
                return $"{(int)(span.TotalDays / 7)} week{((int)(span.TotalDays / 7) > 1 ? "s" : "")} ago";

            if (span.TotalDays < 365)
                return $"{(int)(span.TotalDays / 30)} month{((int)(span.TotalDays / 30) > 1 ? "s" : "")} ago";

            return $"{(int)(span.TotalDays / 365)} year{((int)(span.TotalDays / 365) > 1 ? "s" : "")} ago";
        }

    }
}
