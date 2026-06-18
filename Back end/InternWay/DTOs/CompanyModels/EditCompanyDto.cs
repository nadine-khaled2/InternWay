using System.ComponentModel.DataAnnotations;

namespace InternWay.DTOs.CompanyModels
{
    public class EditCompanyDto
    {

        [Required(ErrorMessage = "Company name is required.")]
        public string companyName { get; set; }

        [Required(ErrorMessage = "Industry is required")]
        public string industry { get; set; }

        [Range(minimum: 1600, maximum: 2026, ErrorMessage = "Please enter a valid year.")]
        public int? foundedYear { get; set; }

        [Required(ErrorMessage = " Description is required ")
        , MinLength(20)
        , MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string description { get; set; }
        [Required(ErrorMessage = "Address is required")]
        public string officeAddress { get; set; }
        [Required(ErrorMessage = "City is required")
            , RegularExpression(@"^[A-Za-z\s]{2,}$" , ErrorMessage ="Invalid city")]
        public string city { get; set; }

        [Required(ErrorMessage = "Country is required")]
        [RegularExpression(@"^[A-Za-z\s]{2,}$", ErrorMessage = "Invalid country")]
        public string country { get; set; }

        [Required(ErrorMessage = "Phone Number is required")
      , RegularExpression("^(010|011|012|015)[0-9]{8}$"
      , ErrorMessage = "Please enter a valid Egyptian phone number .")]
        public string phoneNumber { get; set; }

        [Required(ErrorMessage = "Email is required")
    , EmailAddress(ErrorMessage = "Please enter a valid email")]
        public string email { get; set; }

     [ RegularExpression(@"^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$"
     , ErrorMessage = "Please enter a valid website link")]
        public string? website { get; set; }

        [RegularExpression("^https?:\\/\\/(www\\.)?linkedin\\.com\\/company\\/[A-Za-z0-9\\-]+\\/?$"
       , ErrorMessage = "Please enter a valid LinkedIn company page URL")]
        public string? LinkedIn { get; set; }

        [RegularExpression("^https?:\\/\\/(www\\.)?facebook\\.com\\/[A-Za-z0-9\\.]{5,}\\/?$"
       , ErrorMessage = "Please enter a valid Facebook company URL")]
        public string? Facebook { get; set; }

        [RegularExpression("^https?:\\/\\/(www\\.)?(twitter\\.com|x\\.com)\\/[A-Za-z0-9_]{1,15}\\/?$"
      , ErrorMessage = "Please enter a valid Twitter  profile URL ")]
        public string? Twitter { get; set; }

        [RegularExpression("^https?:\\/\\/(www\\.)?instagram\\.com\\/[A-Za-z0-9_.]{1,30}\\/?$"
       , ErrorMessage = "Please enter a valid Instagram profile URL")]
        public string? Instagram { get; set; }
    }
}
