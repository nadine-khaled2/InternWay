using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace InternWay.DTOs.AIModels
{
    public class InternshipDto
    {
        [Required, JsonPropertyName("id")]
        public int InternId { get; set; }
        [Required, JsonPropertyName("title")]
        public string Title { get; set; }
        [Required, JsonPropertyName("work_type")]
        public string WorkType { get; set; }
        [Required, JsonPropertyName("governrate")]
        public string? Location { get; set; }
        [Required, JsonPropertyName("company_name")]
        public string? CompanyName { get; set; }

        [Required, JsonPropertyName("required_skills")]
        public string? Skills { get; set; }
      


    }
}
