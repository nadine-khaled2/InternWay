using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace InternWay.DTOs.MentorModels
{
    public class UpdateMentorProfileDto
    {
        [Required]
        public string FullName { get; set; }
        [Required, EmailAddress]
        public string Email { get; set; }
        [Required, RegularExpression("^(010|011|012|015)[0-9]{8}$")]
        public string PhoneNumber { get; set; }
        [Required]
        public string Location { get; set; }
        [Required]
        public string JobTitle { get; set; }
        [Required]
        public int YearsExperience { get; set; }
        public string? Linkedin { get; set; }
        public string? Bio { get; set; }

        public IFormFile? CvFile { get; set; }
    }
}
