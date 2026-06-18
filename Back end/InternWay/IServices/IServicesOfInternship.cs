using InternWay.DTOs;
using InternWay.DTOs.CompanyModels;
using InternWay.Models.company_schema;

namespace InternWay.IServices
{
    public interface IServicesOfInternship
    {
        
        Task<( List<getInternshipDto>? , int StatusCode , string message)> getAllOpenInternship();
        Task<(DetailsOfInternDtoForStudent?, int StatusCode, string message)> viewDetailsofInternForStudentAsync(int internshipId);
        Task<(int statuscode, string message)> applyNow(int userId, int internshipId);
       
       
        
       


    }
}
