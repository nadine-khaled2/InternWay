using InternWay.Models.auth_schema;
using InternWay.Models.company_schema;
using InternWay.Models.PaymentSystem;
using InternWay.Models.student_schema;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternWay.Models.mentor_schema
{
    [Table("Mentors", Schema = "mentor"), Index(nameof(user_id), IsUnique = true)]
    public class Mentor 
    {
        public int Mentor_Id { get; set; }
        public int user_id { get; set; }
        public string Job_Title { get; set; }
        public int Years_Experience { get; set; }
        public string? description { get; set; }
        public string? Linkedin { get; set; }
        public string CvPublicID { get; set; }
        public string CvURL { get; set; }
        public string CvFileName { get; set; }
        public string location { get; set; }

        public double AvgRating { get; set; }
        public int CountReviewers { get; set; }

        public User User { get; set; }
        public MentorWallet Wallet { get; set; }    
        public List<Skill> skills { get; set; }
        public List<Mentor_Skill> Mentor_Skills { get; set; }
        public List<Mentor_Availability> mentor_Availabilities { get; set; }
        public List<Experience> Experiences { get; set; }
        public List<Mentor_Experience> Mentor_Experiences { get; set; }
        public List<Review> Reviews { get; set; }   


    }
}
