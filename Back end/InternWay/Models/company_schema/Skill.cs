using InternWay.Models.mentor_schema;
using InternWay.Models.student_schema;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternWay.Models.company_schema
{
    [Table("Skills", Schema = "company"), Index(nameof(Skill_Name), IsUnique = true)]
    public class Skill
    {
        public int Skill_Id { get; set; }
        public string Skill_Name { get; set; }
        public List<Student> students { get; set; }
        public List<Student_Skills> Student_Skills { get; set; }
        public List<Mentor> mentors { get; set; }
        public List<Mentor_Skill> mentor_Skills { get; set; }
        public List<Internship> internships { get; set; }
        public List<Internship_Skills> Internship_Skills { get; set; }
    }
}
