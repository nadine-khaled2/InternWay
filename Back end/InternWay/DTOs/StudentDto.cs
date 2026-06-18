
using InternWay.ValidationAttributesModel;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace InternWay.DTOs
{
    public class StudentDto
    {
        [Required(ErrorMessage = "Full name is required.")
        , MinLength(3, ErrorMessage = "Full name  must be at least 3 characters.")
       , MaxLength(100, ErrorMessage = "Full name cannot exceed 100 characters.")
       , RegularExpression(@"^[A-Za-z\s]+$", ErrorMessage = "Full name must contain only letters and spaces.")]
        public string fullName { get; set; }

        [Required(ErrorMessage = "Email is required")
    , EmailAddress(ErrorMessage = "Please enter a valid email")]
        public string email { get; set; }

        [Required(ErrorMessage = "Password is required.")
        , MinLength(8, ErrorMessage = "Password must be at least 8 characters")
        , RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", ErrorMessage = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.")]
        [Compare("confirmPassword", ErrorMessage = "Password and confirmation do not match")]
        public string password { get; set; }

        [Required(ErrorMessage = "Confirmation password is required.")]
        public string confirmPassword { get; set; }

        [Required(ErrorMessage = "University is required") ] 
        public string university { get; set; }
        [Required(ErrorMessage = "College is required")]
        public string college { get; set; }
        public string? degree { get; set; }
        [Required(ErrorMessage = "Major is required")]
        public string major { get; set; }
        [Required(ErrorMessage = "Graduation year is required")]
        
        public string? gradYear { get; set; }
        public IFormFile cvFile { get; set; } 

        [Required(ErrorMessage = "Phone Number is required")
        , JsonPropertyName("phoneNumber")
       , RegularExpression("^(010|011|012|015)[0-9]{8}$"
           , ErrorMessage = "Invalid phone number.")]
        public string phone { get; set; }
    }
}
