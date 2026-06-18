using System.Text.Json.Serialization;
using static InternWay.Models.company_schema.Internship;

namespace InternWay.DTOs
{
    public class InternshipDataDto
    {
        [JsonPropertyName("id")]
        public int internshipId { get; set; }
        [JsonPropertyName("title")]
        public string title { get; set; }
        public string locationType { get; set; }
        public string? location { get; set; } 
        [JsonPropertyName("payStatus")]
        public string paidStatus { get; set; }
       
        [JsonPropertyName("applicants")]
        public int numberOfApplicants { get; set; }
    }
}
