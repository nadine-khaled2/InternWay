
using InternWay.Models.auth_schema;
using InternWay.Models.company_schema;
using InternWay.Models.mentor_schema;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternWay.Models.student_schema
{
    [Table("Students", Schema = "student"), Index(nameof(user_id), IsUnique = true)]
    public class Student
    {
        public int Student_Id { get; set; }
        public int user_id { get; set; }
        public int SessionLimitedId { get; set; }
        public string University { get; set; }
        public string College { get; set; }
        public string? Degree { get; set; }
        public string Major { get; set; }
        [Range(minimum: 1900, maximum: 2050
      , ErrorMessage = "Please enter a valid graduation year.")]
        public int? Graduation_Year { get; set; }
        public string CvPublicID { get; set; }
        public string CvFileName { get; set; }
        public string? location { get; set; }
        public int NumCancelSession { get; set; }
        public int NumReschaduleSession { get; set; }

        public bool IsCompleteAccount { get; set; }
        public User User { get; set; }
        public Student_Session_limitation? Session_Limitation { get; set; }
        public List<Application> applications { get; set; }

        public List<Skill> skills { get; set; }
        public List<Student_Skills> Student_Skills { get; set; }
        public List<Mentorship_Session> mentorship_Sessions { get; set; }
        public List<Experience> Experiences { get; set; }
        public List<Student_Experience> Student_Experiences { get; set; }

        public List<Review> Reviews { get; set; }

    }
}
