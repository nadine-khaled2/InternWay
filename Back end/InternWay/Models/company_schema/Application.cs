using InternWay.Models.student_schema;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternWay.Models.company_schema
{
    [Table("Applications", Schema = "company")]
    public class Application
    {

        public enum Status_Application

        {
            Pending,
            Accepted,
            Rejected
        }
        public int Application_Id { get; set; }
        public int Student_Id { get; set; }
        public int Internship_Id { get; set; }

        public Status_Application status { get; set; }
        public DateTime applied_at { get; set; }
        public Internship internship { get; set; }
        public Student Student { get; set; }

    }
}
