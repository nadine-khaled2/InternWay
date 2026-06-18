using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace InternWay.DTOs.AIModels
{
    public class StudentMatchResponse
    {
        [Required, JsonPropertyName("user_id")]
        public string StudentId { get; set; }
        [Required, JsonPropertyName("recommendations")]
        public List<MatchScoreDtoForInternships> MoreMatchInternships { get; set; }
     
    }
}
