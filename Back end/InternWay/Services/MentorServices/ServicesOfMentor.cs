using InternWay.DTOs;
using InternWay.IServices;
using InternWay.Models.mentor_schema;
using InternWay.Models.PaymentSystem;
using InternWay.Models.student_schema;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using InternWay.DTOs.MentorModels;
using InternWay.Models.auth_schema;
using Microsoft.AspNetCore.Identity;
using InternWay.Services.StudentServices;
using InternWay.Services.Share;
using Hangfire;

namespace InternWay.Services.MentorServices
{
    public class ServicesOfMentor : IServicesOfMentor
    {
        private readonly InternShipWayDB internShipWay;
        private readonly UserManager<User> userManager;
        private readonly CloudinaryService cloudinary;
        private readonly IServiceProvider serviceProvider;

        public ServicesOfMentor(InternShipWayDB internShipWay, 
            UserManager<User> userManager,
            CloudinaryService cloudinary,
            IServiceProvider serviceProvider)
        {
            this.internShipWay = internShipWay;
            this.userManager = userManager;
            this.cloudinary = cloudinary;
            this.serviceProvider = serviceProvider;
        }
        public async Task CreateWallet(int MentorId)
        {
            if (MentorId == 0)
                return;
            var Wallet = new MentorWallet()
            {
                MentorId = MentorId,
                CurrentBalance = 0,
                PendingBalance = 0,
            };
            await internShipWay.mentorWallets.AddAsync( Wallet );
            await internShipWay.SaveChangesAsync();
        }
        public bool IsValidTime(TimeOnly StartTime, TimeOnly EndTime, out string ErrorMessage)
        {
            if (StartTime >= EndTime)
            {
                ErrorMessage = "End time must be after start time";
                return false;


            }
            ErrorMessage = string.Empty;
            return true;

        }

        public async Task<string> JoinExperiences(List<Experience> experiences)
        {
            if (experiences == null || !experiences.Any())
                return string.Empty;

           return string.Join('\n', experiences.Select(  o => $"{o.title?.Trim()}-{o.companyName?.Trim()}"  ));
        }
        public async Task< List<Experience> > ExtractListOfExperience(int mentorId)
        {
            var ListOfExperiences = await internShipWay.Mentors
                 .Include(e => e.Mentor_Experiences)
                 .ThenInclude(e => e.Experience)
                 .Where(e => e.Mentor_Id == mentorId)
                 .SelectMany(e => e.Experiences)
                 .Select(e => new Experience() { title = e.title, companyName = e.companyName })
                 .ToListAsync();
            
            if(ListOfExperiences != null)
            return ListOfExperiences;
            return null;
        }
        public async Task addExperiencesOfMentor(int mentorId, List<int> ExperienceId)
        {
            List<Mentor_Experience> Relations = new();
            foreach (var ExId in ExperienceId)
            {
                var relation = new Mentor_Experience() { mentor_id = mentorId, expertise_Id = ExId };
                Relations.Add(relation);
            }
            if (Relations != null)
            {
                await internShipWay.Mentor_Experiences.AddRangeAsync(Relations);
                await internShipWay.SaveChangesAsync();

            }
        }
        public async Task addSkillsOfMentor(int mentorId, List<int> SkillIds)
        {
            List<Mentor_Skill> Relations = new();
            foreach (var SId in SkillIds)
            {
                var relation = new Mentor_Skill() { mentor_id = mentorId, skill_Id = SId };
                Relations.Add(relation);
            }
            if (Relations.Any())
            {
                await internShipWay.mentor_Skills.AddRangeAsync(Relations);
                await internShipWay.SaveChangesAsync();
            }
        }

        public async Task<(UpdateResponse, MentorProfileDto?)> UpdateProfile(UpdateMentorProfileDto editedMentor, int UserId)
        {
            using var transaction = await internShipWay.Database.BeginTransactionAsync();
            bool ChangeCV = false;
            try
            {
                var mentor = await internShipWay.Mentors
                    .Include(m => m.User)
                    .Include(m => m.skills)
                    .Include(m => m.Mentor_Skills)
                    .Include(m => m.Experiences)
                    .Include(m => m.Mentor_Experiences)
                    .FirstOrDefaultAsync(m => m.user_id == UserId);

                if (mentor == null)
                {
                    await transaction.RollbackAsync();
                    return (new UpdateResponse { message = "User unauthenticated", cvChange = ChangeCV, statusCode = 401 }, null);
                }

                var existing = await userManager.FindByEmailAsync(editedMentor.Email);
                if (existing != null && existing.Id != UserId)
                {
                    await transaction.RollbackAsync();
                    return (new UpdateResponse { message = "This email is already in use. Please use a different email.", cvChange = ChangeCV, statusCode = 409 }, null);
                }

                // Update User
                mentor.User.Full_Name = editedMentor.FullName;
                mentor.User.Email = editedMentor.Email;
                mentor.User.UserName = editedMentor.Email;
                mentor.User.NormalizedEmail = editedMentor.Email.ToUpper();
                mentor.User.NormalizedUserName = editedMentor.Email.ToUpper();
                mentor.User.Update_at = DateTime.UtcNow;
                mentor.User.PhoneNumber = editedMentor.PhoneNumber;

                // Update Mentor
                mentor.location = editedMentor.Location;
                mentor.Job_Title = editedMentor.JobTitle;
                mentor.Years_Experience = editedMentor.YearsExperience;
                mentor.Linkedin = editedMentor.Linkedin;
                mentor.description = editedMentor.Bio;

                if (editedMentor.CvFile != null)
                {
                    if (!cloudinary.ValidationCvUpLoad(editedMentor.CvFile, out string error))
                    {
                        await transaction.RollbackAsync();
                        return (new UpdateResponse { message = error, statusCode = 400, cvChange = ChangeCV }, null);
                    }

                    var response = await cloudinary.UpdateCV(editedMentor.CvFile, mentor.CvPublicID);
                    var newPublicId = response.PublicId.CleanPublicId();

                    if (string.IsNullOrEmpty(newPublicId) || string.IsNullOrEmpty(response.fileName))
                    {
                        await transaction.RollbackAsync();
                        return (new UpdateResponse { message = "Something went wrong while uploading the file. Please try again.", statusCode = 400, cvChange = ChangeCV }, null);
                    }

                    ChangeCV = true;
                    mentor.CvPublicID = newPublicId;
                    mentor.CvFileName = response.fileName;

                    // Clear old skills and experiences
                    if (mentor.Mentor_Skills != null && mentor.Mentor_Skills.Any())
                        internShipWay.mentor_Skills.RemoveRange(mentor.Mentor_Skills);

                    if (mentor.Mentor_Experiences != null && mentor.Mentor_Experiences.Any())
                        internShipWay.Mentor_Experiences.RemoveRange(mentor.Mentor_Experiences);

                    // Resolve ServicesExternalAi dynamically to avoid circular dependency
                    var servicesExternalAi = (ServicesExternalAi)serviceProvider.GetService(typeof(ServicesExternalAi));
                    
                    var InfoCv = await servicesExternalAi.GetCvFilePath(editedMentor.CvFile, mentor.Mentor_Id);
                    
                    var OperationId = BackgroundJob.Enqueue<ServicesExternalAi>(
                        e => e.ExtractAndStoreMentorInformation(InfoCv.filePath, InfoCv.length, mentor.Mentor_Id)
                    );
                }

                await internShipWay.SaveChangesAsync();
                await transaction.CommitAsync();

                return (new UpdateResponse { message = "Profile updated successfully.", statusCode = 200, cvChange = ChangeCV }, null);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return (new UpdateResponse { message = "Something went wrong while processing your request. Please try again.", statusCode = 500, cvChange = ChangeCV }, null);
            }
        }
    }
}
