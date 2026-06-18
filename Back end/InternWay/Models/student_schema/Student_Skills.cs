using InternWay.Models.company_schema;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternWay.Models.student_schema
{
    [Table("Student_Skills", Schema = "student")]
    public class Student_Skills
    {
        public int student_id { get; set; }
        public int skill_id { get; set; }
        public Student Student { get; set; }
        public Skill Skill { get; set; }
    }
}
