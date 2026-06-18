using System.Text.Json.Serialization;
using static InternWay.Models.company_schema.Application;

namespace InternWay.DTOs
{
    public class ApplicantDataDto
    {
        [JsonPropertyName("id")]
        public int Applicant_Id { get; set; }
        public int internId { get; set; }
       
        [JsonPropertyName("name")]
        public string Applicant_Name { get; set; }
       
        [JsonPropertyName("role")]
        public string internTitle { get; set; }

        [JsonPropertyName("timeAgo")]
        public string applied_at { get; set; } // 

        [JsonPropertyName("status")]
        public string status { get; set; }

    }
}
