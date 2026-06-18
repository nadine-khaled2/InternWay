using InternWay.DTOs;

using InternWay.Models.company_schema;
using InternWay.Models.mentor_schema;
using InternWay.Models.PaymentSystem;
using InternWay.Models.student_schema;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternWay.Models.auth_schema
{
    [Table("Users", Schema = "auth"), Index(nameof(Email), IsUnique = true)]
    public  class User : IdentityUser<int>
    {
        public enum Roles
        {
            student,
            mentor,
            company
        }
       
        
        public string Full_Name { get; set; }

        public Roles Role { get; set; }
        [Required]
        public DateTime Create_at { get; set; }
      
        public DateTime? Update_at { get; set; }
        public List<Notification> notifications { get; set; }
        public Student Student { get; set; }
        public Company Company { get; set; }
        public Mentor Mentor { get; set; }

        public List<RefreshToken> RefreshTokens { get; set; }
       
    }
}
