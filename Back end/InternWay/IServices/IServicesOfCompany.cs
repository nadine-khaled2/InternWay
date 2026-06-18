using InternWay.DTOs;
using InternWay.DTOs.AIModels;
using InternWay.DTOs.CompanyModels;
using InternWay.Models.company_schema;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;

namespace InternWay.IServices
{
    public interface IServicesOfCompany
    {
       
        Task<(int StatusCode , string message ,AllDataForCompanyDto?)> getDataOfCompany(int UserId);
        Task<(string Message, int StatusCode)> AddIntern(NewInternshipDto NewIntern , int userId);
   
        Task UpdateSkillsOfintern(int internId, List<int> SkillId);
        Task<(List<DataForApplicantDto>?, int statusCode, string message)> ViewAllApplicantsForCompany( int userId);
        Task<(DetailsOfInternDtoForCompany?, int statusCode ,  string message)> ViewDetailsOfInternForcompany(int internId ,  int userId);
        Task<(List<DataOfInternshipDto>?, int statusCode)> GetAllInternshipForCompany(int companyId);
        Task<(string message, int statuscode)> RejectApplicant(int internshipId, int UserId, int applicantId);
        Task<(string message, int statuscode)> AcceptApplicant(int internshipId, int UserId, int applicantId);
        Task<(Stream? stream, string message, string fileName, string contentType, int statuscode)> DownloadCV( int UserId, int applicantId);
        Task<(ProfileOfCompanyDto?, int StatusCode)> getprofileOfCompany(int userId);
        Task<(ProfileOfCompanyDto?, int statusCode)> EditCompany( EditCompanyDto Editingcompany, int userId);
        Task<(DataOfInternshipDto?, int statusCode, string message)> EditIntern(int userId, RequestEditedInternshipDto EditingInternship);
        Task<(int statusCode , string message)> DeleteIntern(int internshipId, int userId);
        Task<(int statusCode, string message)> OpenIntern(OpenInternRequest openRequest, int userId);
        Task<(int statusCode, string message)> CloseIntern(int internshipId, int userId);
        Task<(EditInternshipDto?, int statusCode)> GetDataForEditingIntern(int internId , int userId);
        Task<(List<DataForApplicantDto>?, int statusCode, string message)> ViewApplicantsByIntern(int internshipId, int userId);
        Task<(List<MatchScoreForApplicant>?, int statusCode, string message)> GetMatchScoreOfApplicants(int internshipId, int UserId);

    }
}
