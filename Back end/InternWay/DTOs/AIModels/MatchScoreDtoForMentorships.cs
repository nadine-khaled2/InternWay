using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace InternWay.DTOs.AIModels
{
    public class MatchScoreDtoForMentorships
    {
        [Required, JsonPropertyName("mentor_id")]
        public int Id { get; set; }
        [Required, JsonPropertyName("score")]
        public float score { get; set; }
    }
}
