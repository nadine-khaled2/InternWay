using InternWay.DTOs;
using InternWay.DTOs.MentorModels;
using InternWay.Models.student_schema;

namespace InternWay.IServices
{
    public interface IServicesOfMentor
    {

        Task CreateWallet(int MentorId);
        Task<string> JoinExperiences(List<Experience> experiences);
        Task<List<Experience>> ExtractListOfExperience(int mentorId);
        Task addExperiencesOfMentor(int mentorId, List<int> ExperienceId);
        Task addSkillsOfMentor(int mentorId, List<int> SkillIds);
        Task<(UpdateResponse, MentorProfileDto?)> UpdateProfile(UpdateMentorProfileDto editedMentor, int UserId);
    }
}
