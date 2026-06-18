using InternWay.Models.company_schema;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternWay.Models.student_schema
{
    [Table("Student_Experiences", Schema = "student")]
    public class Student_Experience
    {
        public int student_id { get; set; }
        public int expertise_Id { get; set; }
        public Student Student { get; set; }
        public Experience Experience { get; set; }
    }
}
