using System.Text.Json.Serialization;

namespace InternWay.DTOs.AIModels
{
    public class MentorJson
    {
        [JsonPropertyName("mentor_id")]
        public int MentorId { get; set; }
        [JsonPropertyName("job_title")]
        public string? JopTitle { get; set; }
        [JsonPropertyName("years_experience")]
        public int? Years_Experience { get; set; }
        [JsonPropertyName("rating")]
        public float Rating { get; set; }
        [JsonPropertyName("location")]
        public string? Location { get; set; }
        [JsonPropertyName("skills")]
        public List<string>? SkillS { get; set; }
        [JsonPropertyName("experiences")]
        public List<string>? Experiences { get; set; }

    }
}
