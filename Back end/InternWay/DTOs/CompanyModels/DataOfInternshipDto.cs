using System.Text.Json.Serialization;

namespace InternWay.DTOs.CompanyModels
{
    public class DataOfInternshipDto
    {
        [JsonPropertyName("id")]
        public int Internship_Id { get; set; }
        public string title { get; set; }
      
        [JsonPropertyName("workType")]
        public string locationType { get; set; }
        public string? city { get; set; }
       
        [JsonPropertyName("isPaid")]
        public string paidStatus { get; set; }
       
        [JsonPropertyName("salary")]
        public string? price { get; set; }
        public string status { get; set; }
        public string deadline { get; set; }
       
        [JsonPropertyName("applications")]
        public int applicationsCount { get; set; }

    }
}
