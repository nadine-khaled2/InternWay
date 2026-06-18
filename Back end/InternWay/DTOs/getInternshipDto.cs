using static InternWay.Models.company_schema.Internship;

namespace InternWay.DTOs
{
    public class getInternshipDto
    {
        public int internshipId { get; set; }
        public string title { get; set; }
        public string companyName { get; set; }
        public int durationMonths { get; set; } // هسال الفرونت عايزينها ايه
        public string locationType { get; set; }
        public string? city { get; set; }
        public string Deadline { get; set; }
        public List<string> requiredSkills { get; set; }
        public string paidStatus { get; set; }
        public double? price { get; set; }


    }
}
