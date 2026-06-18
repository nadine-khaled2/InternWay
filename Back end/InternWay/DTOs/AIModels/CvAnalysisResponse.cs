
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace InternWay.DTOs.AIModels
{
    public class CvAnalysisResponse
    {

        [Required, JsonPropertyName("user_id")]
        public string UserId { get; set; }
        [Required, JsonPropertyName("location") ]
        public  Location location { get; set; }
        [Required, JsonPropertyName("skills")]
        public List<string> Skills { get; set; } = new();
        [Required, JsonPropertyName("experience")]
        public List<ExperienceDto> Experiences { get; set; } = new();

    }
}
