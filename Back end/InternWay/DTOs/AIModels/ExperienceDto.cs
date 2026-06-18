using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace InternWay.DTOs.AIModels
{
    public class ExperienceDto
    {
        [Required, JsonPropertyName("title")]
        public string title { get; set; }
        [Required, JsonPropertyName("company")]
        public string? companyName { get; set; }
        [Required, JsonPropertyName("startDate")]
        public string? startDate { get; set; }
        [Required, JsonPropertyName("endDate")]
        public string? endDate { get; set; }
    }
}
