using InternWay.DTOs.CompanyModels;
using static InternWay.Models.company_schema.Internship;

namespace InternWay.DTOs
{
    public class DetailsOfInternDtoForCompany
    {

        public int internId { get; set; }
        public string title { get; set; }
        public string description { get; set; }
        public int duration { get; set; }
        public string locationType { get; set; }
        public string CreatedAt { get; set; }
        public string DeadlineDate { get; set; }
        public string? updateAt { get; set; }
        public bool IsPaid { get; set; }
        public double? price { get; set; }
        public string status { get; set; }
        public bool  IsOpen { get; set; }
        public string? Internship_City { get; set; }
        public string? Internship_Country { get; set; }
        public List<string> skills { get; set; }
        public List<string> requirements { get; set; }
        public int applicationsCount { get; set; }
       

    }
}
