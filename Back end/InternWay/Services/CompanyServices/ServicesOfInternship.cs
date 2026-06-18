using InternWay.DTOs;
using InternWay.DTOs.CompanyModels;
using InternWay.IServices;
using InternWay.Models.company_schema;
using InternWay.Models.student_schema;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Reflection.Metadata.Ecma335;
using System.Threading.Tasks;
using static InternWay.Models.company_schema.Internship;

namespace InternWay.Services.CompanyServices
{
    public class ServicesOfInternship : IServicesOfInternship
    { 
        private readonly InternShipWayDB internShipWay;
        private readonly IServicesOfCompany servicesOfCompany;
        private readonly InternWay.IServices.INotificationService _notificationService; 
        
        public ServicesOfInternship(InternShipWayDB internShipWay, IServicesOfCompany servicesOfCompany, InternWay.IServices.INotificationService notificationService)
        {
            this.internShipWay = internShipWay;
            this.servicesOfCompany = servicesOfCompany; 
            _notificationService = notificationService;
        }

        public async Task<(int statuscode , string message)> applyNow(int userId, int internshipId)
        {
            try
            {
                var student = await internShipWay.Students
                            .FirstOrDefaultAsync(s => s.user_id == userId);
                if (student == null)
                    return (401, "Student not found.");

                var intern = await internShipWay.Internships.Include(e=>e.company)
                    .Include(e=>e.applications)
                    .FirstOrDefaultAsync(e => e.Internship_Id == internshipId);
                if (intern == null)
                    return (404, "Internship not found .");
                if (intern.IsClose)
                    return (400, "Internship is currently close.Please check back later.");

                var existApplicant = intern.applications?
                    .FirstOrDefault(a=>a.Internship_Id==internshipId && a.Student_Id == student.Student_Id);
                if (existApplicant != null)
                    return (409 , "You already applied for this internship.");

               
                var applicant = new Application
                {
                    Student_Id = student.Student_Id,
                    Internship_Id = internshipId
                };

                await internShipWay.Applications.AddAsync(applicant);
                await internShipWay.SaveChangesAsync();
                var studentUser = await internShipWay.Users.FirstOrDefaultAsync(u => u.Id == student.user_id);
                string studentName = studentUser?.Full_Name ?? "A student";
                await _notificationService.CreateAndSendNotificationAsync(intern.company.user_id, "New Application Received", $"{studentName} has applied for your internship: {intern.title}.", "CompanyApplication", internshipId);
                return (200, "You applied successfully.");
            }
            catch(Exception )
            {
                return (500, "Something went wrong while processing your request. Please try again.");
            }
        }
       
        public async Task<(List<getInternshipDto>?, int StatusCode, string message)> getAllOpenInternship()
        {
            try
            {
                var OpenInternships = await internShipWay.Internships
                     .Include(e => e.company)
                     .Include(e => e.skills)
                     .Where(e =>e.status == Status.Open 
                     && e.Revoked_At == null 
                     && e.application_deadline >= DateOnly.FromDateTime(DateTime.UtcNow))
                     .ToListAsync();

                if (!OpenInternships.Any() )
                    return (null, 200, "No internships are currently available. Please check back later.");

                var Internships = OpenInternships.Select(i => new getInternshipDto
                {
                    internshipId = i.Internship_Id
                     ,
                    companyName = i.company?.company_name ?? string.Empty
                     ,
                    title = i.title
                     ,
                    durationMonths = i.duration_months
                     ,
                    Deadline = i.application_deadline.ToString(" MMM d, yyyy " , CultureInfo.InvariantCulture)
                     ,
                    locationType = i.location_type.ToString()
                     ,
                    city = !string.IsNullOrWhiteSpace(i.location)? i.location?.Split(',')[0].Trim() : null
                     ,
                    paidStatus = i.paid_status.ToString()
                     ,
                    price = i.priceInternship
                     ,
                    requiredSkills = i.skills?.Select(s => s.Skill_Name).ToList() ?? new List<string>()

                }).ToList();
  
                return (Internships, 200, "Internships retrieved successfully.");
            }
            catch (Exception )
            {
                return (null, 500, "Something went wrong while processing your request. Please try again.");
            }
            }

       
        public async Task<(DetailsOfInternDtoForStudent?, int StatusCode, string message)> viewDetailsofInternForStudentAsync(int internshipId)
        {
            try
            {
                var internship = await internShipWay.Internships
                    .Include(e => e.company)
                    .Include(e => e.skills)
                    .Include(e => e.applications)
                   .FirstOrDefaultAsync(i => i.Internship_Id == internshipId);
                if (internship == null)
                    return (null, 404, "Internship not found.");

                if (internship.company == null)
                    return (null, 404, " Company not found .");

                List<string> skills = internship.skills?
                    .Select(s => s.Skill_Name).ToList() ?? new List<string>();

                List<string> requirements = internship.requirements?
                    .Split('\n' , StringSplitOptions.RemoveEmptyEntries)
                    .Select(r=>r.Trim())
                    .ToList() ?? new List<string>();

                var locationPartsOfIntern = !string.IsNullOrWhiteSpace(internship.location)?
                    internship.location.Split(',')
                    .ToList() : new List<string>();
               
                var CityOfIntern = locationPartsOfIntern?
                    .Count() > 0 ? locationPartsOfIntern[0]?.Trim() : null;
               
                var CountryOfIntern = locationPartsOfIntern?
                    .Count() > 1 ? locationPartsOfIntern[1]?.Trim() : null;


                var locationPartsOfCompany = internship.company.location?
                    .Split(',').ToList() ?? new List<string>();
              
                var CityOfCompany = locationPartsOfCompany?
                    .Count() > 0 ? locationPartsOfCompany[0]?.Trim() : null;
              
                var CountryOfCompany = locationPartsOfCompany?
                    .Count() > 1 ? locationPartsOfCompany[1]?.Trim() : null;

             
                var DataOfIntern = new DetailsOfInternDtoForStudent()
                {
                    internId = internship.Internship_Id
                    ,
                    title = internship.title
                    ,
                    description = internship.description
                    ,
                    requirements = requirements
                    ,
                    skills = skills
                    ,
                    duration = internship.duration_months
                    ,
                    locationType = internship.location_type.ToString()
                    ,
                    Internship_City = CityOfIntern
                    ,
                    Internship_Country = CountryOfIntern
                    ,
                    endDate = internship.application_deadline.ToString("MMM d,yyyy", CultureInfo.InvariantCulture)
                    ,
                    startDate = internship.Create_at.ToString("MMM d,yyyy", CultureInfo.InvariantCulture)
                    ,
                    IsPaid = internship.paid_status == Baid_Status.Paid 
                    ,
                    price = internship.priceInternship
                    ,
                    status = internship.status.ToString()
                    ,
                    canApply = !internship.IsClose
                    ,
                    applicationsCount = internship.applications?.Count() ?? 0
                    ,
                    company = new companyDataDto()
                    {
                        Name = internship.company.company_name,
                        WebSit = internship.company.website,
                        City = CityOfCompany,
                        Country = CountryOfCompany,
                        Industry = internship.company.industry,
                    }
                };


                return (DataOfIntern, 200,string.Empty);
            }
            catch (Exception)
            {
                return (null, 500, "Something went wrong while processing your request. Please try again.");
            }
        }

    }
}
