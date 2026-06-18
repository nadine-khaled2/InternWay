using System.Text.Json.Serialization;

namespace InternWay.DTOs.AIModels
{
    public class MentorshipsMatchRequest
    {
        [JsonPropertyName("student_id")]
        public string StudentId { get; set; }
        [JsonPropertyName("skills")]
        public List<string>? SkillS { get; set; }
        [JsonPropertyName("experiences")]
        public List<string>? Experiences { get; set; }
        [JsonPropertyName("mentors_data")]
        public List<MentorJson> Mentors { get; set; }
    }
}
