using InternWay.Models.company_schema;
using InternWay.ValidationAttributesModel;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Numerics;
using System.Text.Json.Serialization;

namespace InternWay.DTOs.CompanyModels
{
    public class RequestEditedInternshipDto
    {
        [JsonPropertyName("internId")]
        public int internId { get; set; }

        [Required(ErrorMessage = "Internship Title is required"), JsonPropertyName("title")]
        public string internTitle { get; set; }

        [Required(ErrorMessage = "Insert description of your internship"), JsonPropertyName("description")]
        public string internDescription { get; set; }

        [Required(ErrorMessage = "Selecting a work type is required."),
         RegularExpression(@"^(Remote|Onsite|Hybrid)$"
        , ErrorMessage = "UserType must be Remote, On_site, or Hybrid.")]
        public string workType { get; set; }

        [Required(ErrorMessage = "Location is required")
            , JsonPropertyName("governorate")
       , RegularExpression("^[A-Za-z]+(?: [A-Za-z]+)*\\s*,\\s*[A-Za-z]+(?: [A-Za-z]+)*$", ErrorMessage = "Invalid location format. Please enter City and Country separated by a comma (e.g. Cairo, Egypt).")]

        public string location { get; set; }

        [Required(ErrorMessage = "Duration of internship is required"),
         Range(1, int.MaxValue, ErrorMessage = "Please enter a valid internship duration in months.")]
        public int duration { get; set; } 

        [Required(ErrorMessage = "Please select whether the internship is paid or unpaid ."), JsonPropertyName("isPaid"),
         RegularExpression(@"^(Paid|Unpaid)$"
        , ErrorMessage = "UserType must be Paid or Unpaid .")]
        public string baidStatus { get; set; }
       
        [JsonPropertyName("salary")]
        public double? priceInternship { get; set; }
        
        [Required(ErrorMessage = "Application deadline is required ."), JsonPropertyName("deadline"), ValidateDeadline]
        public string applicationDeadline { get; set; }

        [Required(ErrorMessage = "Please add at least one requirement.")]
        [MinLength(1, ErrorMessage = "Please add at least one requirement.")]
        public List<string> requirements { get; set; } 

        [Required(ErrorMessage = "Please add at least one required skill."), JsonPropertyName("skills")]
        [MinLength(1, ErrorMessage = "Please add at least one required skill.")]
        public List<string> RequiredSkills { get; set; } 
    }
}
