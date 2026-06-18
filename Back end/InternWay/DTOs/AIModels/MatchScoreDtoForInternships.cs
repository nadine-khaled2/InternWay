using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace InternWay.DTOs.AIModels
{
    public class MatchScoreDtoForInternships
    {

        [Required, JsonPropertyName("id")]
        public int Id { get; set; }
        [Required, JsonPropertyName("score")]
        public double score { get; set; }
    }
}
