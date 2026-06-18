using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace InternWay.DTOs.AIModels
{
    public class InternshipMatchResponse
    {
        [Required, JsonPropertyName("")]
        public string internId { get; set; }
        [Required, JsonPropertyName("")]
        public List<MatchScoreDtoForInternships>? ApplicantsMatches { get; set; }
        
    }
}
