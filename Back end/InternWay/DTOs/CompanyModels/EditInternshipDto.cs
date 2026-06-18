using InternWay.ValidationAttributesModel;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace InternWay.DTOs.CompanyModels
{
    public class EditInternshipDto
    {
        public int internId { get; set; }

        [JsonPropertyName("title")]
        public string internTitle { get; set; }

        [JsonPropertyName("description")]
        public string internDescription { get; set; }

        public string workType { get; set; }
       
        [JsonPropertyName("governorate")]
        public string? location { get; set; }
        public int duration { get; set; } 
      
        [JsonPropertyName("paidStatus")]
        public string BaidStatus { get; set; }
      
        [JsonPropertyName("isPaid")]
        public Boolean IsPaid { get; set; }
     
        [JsonPropertyName("salary")]
        public double? priceInternship { get; set; }
       
        [JsonPropertyName("deadline")]

        public string application_deadline { get; set; }

        public List<string> requirements { get; set; }
      
        [JsonPropertyName("skills")]

        public List<string> RequiredSkills { get; set; } 

    }
}
