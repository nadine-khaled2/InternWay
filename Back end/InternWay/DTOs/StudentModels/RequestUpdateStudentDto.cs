
using System.ComponentModel.DataAnnotations;
namespace InternWay.DTOs.StudentModels
{
    public class RequestUpdateStudentDto
    {
        [Required(ErrorMessage = "Full name is required.")
       , MinLength(3, ErrorMessage = "Full name  must be at least 3 characters.")
      , MaxLength(100, ErrorMessage = "Full name cannot exceed 100 characters.")
      , RegularExpression(@"^[A-Za-z\s]+$"
     , ErrorMessage = "Full name must contain only letters and spaces.")]
        public string fullName { get; set; }

        [Required(ErrorMessage = "Email is required")
   , EmailAddress(ErrorMessage = "Please enter a valid email")]
        public string email { get; set; }

        [Required(ErrorMessage = "Phone Number is required")
       , RegularExpression("^(010|011|012|015)[0-9]{8}$"
            , ErrorMessage = "Invalid phone number.")]
        public string phone { get; set; }


        [Required(ErrorMessage = "University is required")]
        public string university { get; set; }

        [Required(ErrorMessage = "College is required")]
        public string college { get; set; }

        [Required(ErrorMessage = "Major is required")]
        public string major { get; set; }

        [Required(ErrorMessage = "Graduation year is required")
       , Range(minimum: 1900, maximum: 2100
       , ErrorMessage = "Please enter a valid graduation year.")]
        public int gradYear { get; set; }

        public IFormFile? CvFile  { get; set; }
        
    }
}
