using System.ComponentModel.DataAnnotations;

namespace InternWay.DTOs
{
    public class ResetPasswordDto
    {
        [ Required(ErrorMessage = "Email is required")
        , EmailAddress(ErrorMessage = "Please enter a valid email")]
        public string email { get; set; }

        [Required]
        public string token { get; set; }

        [Required(ErrorMessage = "Password is required.")
        , MinLength(8, ErrorMessage = "Password must be at least 8 characters")
        , RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", ErrorMessage = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.")]
        public string newPassword { get; set; }

    }
}
