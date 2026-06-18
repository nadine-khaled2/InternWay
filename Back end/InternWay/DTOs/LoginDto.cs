using System.ComponentModel.DataAnnotations;

namespace InternWay.DTOs
{
    public class LoginDto
    {
        [Required(ErrorMessage = "Email is required")
       , EmailAddress(ErrorMessage = "Please enter a valid email")]
        public string email { get; set; }
        [Required(ErrorMessage = "Password is required.")
        , MinLength(8, ErrorMessage = "Password must be at least 8 characters")
        , RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", ErrorMessage = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.")]
        public string password { get; set; }
        [Required(ErrorMessage = "Selecting a user type is required.") ,
         RegularExpression(@"^(student|mentor|company)$", ErrorMessage = "UserType must be Student, Company, or Mentor.")]
        public string userType {  get; set; }
    }
}
