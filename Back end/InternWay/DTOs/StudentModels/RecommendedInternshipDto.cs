using static InternWay.Models.company_schema.Internship;

namespace InternWay.DTOs.StudentModels
{
    public class RecommendedInternshipDto
    {
        public int internshipId { get; set; }
        public string title { get; set; }
        public string? companyName { get; set; }
        public string locationType { get; set; }
        public string? city { get; set; }
        public double matchScore { get; set; }


    }
}
