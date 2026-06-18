using InternWay.DTOs.CompanyModels;
using InternWay.Models.company_schema;
using static InternWay.Models.company_schema.Internship;

namespace InternWay.DTOs
{
    public class DetailsOfInternDtoForStudent
    {

        public int internId { get; set; }
        public string title { get; set; }
        public string description { get; set; }
        public int duration { get; set; }
        public string locationType { get; set; }
        public string startDate { get; set; }
        public string endDate { get; set; }
        public bool IsPaid { get; set; }
        public double? price { get; set; }
        public string status { get; set; }
        public bool canApply { get; set; }
        public string? Internship_City { get; set; }
        public string? Internship_Country { get; set; }
        public List<string> skills { get; set; }
        public List<string> requirements { get; set; }
        public int applicationsCount { get; set; }
        public companyDataDto company { get; set; }


    }
}
