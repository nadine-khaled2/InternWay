
using InternWay.ValidationAttributesModel;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace InternWay.DTOs
{ 
    public class CompanyDto
    {
        [Required(ErrorMessage = "Company name is required.")]
     
        public string companyName { get; set; }
      
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


        [Required(ErrorMessage = "Industry is required")]
        public string industry { get; set; }
       
        [Required(ErrorMessage = "Location is required") 
       , RegularExpression("^[A-Za-z]+(?: [A-Za-z]+)*\\s*,\\s*[A-Za-z]+(?: [A-Za-z]+)*$"
      , ErrorMessage = "Invalid location format. Please enter City and Country separated by a comma (e.g. Cairo, Egypt).")]
        public string location { get; set; }

        [Required(ErrorMessage = " Description is required ")
        , MinLength(20)
        , MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string description { get; set; }
        [
        RegularExpression(@"^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$"
        , ErrorMessage = "Please enter a valid website link")
           , JsonPropertyName("website")]
        public string? webSite { get; set; }//  8 required?
       
        [Required(ErrorMessage = "Address is required")]
        public string address { get; set; }

        [Required(ErrorMessage = "Phone Number is required")
        , JsonPropertyName("phoneNumber")
       , RegularExpression("^(010|011|012|015)[0-9]{8}$"
       , ErrorMessage = "Please enter a valid Egyptian phone number .")]
        public string phone { get; set; }


         
    }
}
