using Org.BouncyCastle.Bcpg.OpenPgp;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace InternWay.DTOs.AIModels
{
    public class StudentMatchRequest
    {
        [JsonPropertyName("student")]
        public StudentForInternshipJson student { get; set; }
        [JsonPropertyName("internships")]
        public List<InternshipDto> Internships { get; set; }
      
    }
}
