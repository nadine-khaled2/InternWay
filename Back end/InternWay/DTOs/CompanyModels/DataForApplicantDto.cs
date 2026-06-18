using System.Text.Json.Serialization;
using static InternWay.Models.company_schema.Application;

namespace InternWay.DTOs.CompanyModels
{
    public class DataForApplicantDto
    {
        [JsonPropertyName("id")]
        public int applicantId { get; set; }

        [JsonPropertyName("internId")]
        public int internId { get; set; }

        [JsonPropertyName("name")]
        public string applicantName { get; set; }
        public string internTitle { get; set; }
        public string university { get; set; }
        public string major { get; set; }
        public string email { get; set; }
        public string phone { get; set; }
        public string status { get; set; }
        public string appliedAt { get; set; } 
       


    }
}
