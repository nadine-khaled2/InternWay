using System.Text.Json.Serialization;

namespace InternWay.DTOs.AIModels
{
    public class StudentForInternshipJson
    {
        [JsonPropertyName("user_id")]
        public string StudentId { get; set; }
        [JsonPropertyName("skills")]
        public List<string>? SkillS { get; set; }
        [JsonPropertyName("experiences")]
        public List<ExperienceDto>? Experiences { get; set; }
        [JsonPropertyName("location")]
        public Location? Location { get; set; }

    }
}
