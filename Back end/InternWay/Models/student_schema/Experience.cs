using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using InternWay.Models.mentor_schema;

namespace InternWay.Models.student_schema
{
     [Table("Experiences", Schema = "student")]
    public class Experience
    {
       
        public int expertiseId { get; set; }

        public string title { get; set; }

        public string? companyName { get; set; }

        public string? startDate { get; set; }

        public string? endDate { get; set; }

        public List<Student> students { get; set; }

        public List<Student_Experience> student_Experiences { get; set; }
        public List<Mentor> mentors { get; set; }
        public List<Mentor_Experience> mentor_Experiences { get; set; }

        public override string ToString()
        {
            var parts = new List<string>();

            if (!string.IsNullOrWhiteSpace(title))
                parts.Add(title);

            if (!string.IsNullOrWhiteSpace(companyName))
                parts.Add($"at {companyName}");

            var dates = "";

            if (!string.IsNullOrWhiteSpace(startDate) && !string.IsNullOrWhiteSpace(endDate))
                dates = $"({startDate} - {endDate})";
            else if (!string.IsNullOrWhiteSpace(startDate))
                dates = $"(From {startDate})";
            else if (!string.IsNullOrWhiteSpace(endDate))
                dates = $"(Until {endDate})";

            if (!string.IsNullOrWhiteSpace(dates))
                parts.Add(dates);

            return string.Join(" ", parts);
        }

    }
}
