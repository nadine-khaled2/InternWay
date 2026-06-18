using System.ComponentModel.DataAnnotations;

namespace InternWay.DTOs
{
    public class ForgetPasswordDto
    {
        [Required(ErrorMessage = "Email is required")
       , EmailAddress(ErrorMessage = "Please enter a valid email")]
        public string email { get; set; }
    }
}
