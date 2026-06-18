
using InternWay.ValidationAttributesModel;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace InternWay.DTOs
{
    public class MentorDto 
    {
        [Required(ErrorMessage = "Full name is required.")
        , MinLength(3, ErrorMessage = "Full name  must be at least 3 characters.")
       , MaxLength(100, ErrorMessage = "Full name cannot exceed 100 characters.")
       , RegularExpression(@"^[A-Za-z\s]+$", ErrorMessage = "Full name must contain only letters and spaces.")]
        public string fullName { get; set; }//1
        [Required(ErrorMessage = "Email is required")
    , EmailAddress(ErrorMessage = "Please enter a valid email")
    ]
        public string email { get; set; }//2

        [Required(ErrorMessage = "Password is required.")
        , MinLength(8, ErrorMessage = "Password must be at least 8 characters")
        , RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", ErrorMessage = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.")]
        [Compare("confirmPassword", ErrorMessage = "Password and confirmation do not match")]
        public string password { get; set; }//3
        [Required(ErrorMessage = "Confirmation password is required.")]
        public string confirmPassword { get; set; }//4

        [Required(ErrorMessage = "Job title is required")]
        public string jobTitle { get; set; }//6

        [Required(ErrorMessage = "Years of experience is required")]
        [Range(minimum: 1, maximum: 100, ErrorMessage = "Invalid years of experience")]
        public int yearsExperience { get; set; }//7
        [RegularExpression(@"^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9\-_]+\/?$", ErrorMessage = "Invalid LinkedIn URL")]
        public string? linkedin { get; set; }//8
        public IFormFile cvFile { get; set; }

        [Required(ErrorMessage = "Phone Number is required")
         ,JsonPropertyName("phoneNumber")
        , RegularExpression("^(010|011|012|015)[0-9]{8}$", ErrorMessage = "Invalid phone number.")]
        public string phone { get; set; }
    }
}
