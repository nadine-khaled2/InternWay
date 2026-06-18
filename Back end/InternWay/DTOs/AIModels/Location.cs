using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace InternWay.DTOs.AIModels
{
    public class Location
    {
        [Required, JsonPropertyName("city")]
        public string? city {  get; set; }
        [Required, JsonPropertyName("country")]
        public string? country { get; set; }
    }
}
