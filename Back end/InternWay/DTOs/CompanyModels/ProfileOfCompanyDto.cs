using System.ComponentModel.DataAnnotations;

namespace InternWay.DTOs.CompanyModels
{
    public class ProfileOfCompanyDto
    {
        public string companyName { get; set; }
        public string industry { get; set; }
        public int? foundedYear { get; set; }
        public string description { get; set; }
        public string officeAddress { get; set; }
        public string? city { get; set; }
        public string? country { get; set; }
        public string phoneNumber { get; set; }
        public string email { get; set; }
        public string? website { get; set; }
        public string? LinkedIn { get; set; }
        public string? Facebook { get; set; }
        public string? Twitter { get; set; }
        public string? Instagram { get; set; }
    }
}
