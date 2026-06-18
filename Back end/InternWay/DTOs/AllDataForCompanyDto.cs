using InternWay.DTOs.AIModels;
using System.Text.Json.Serialization;

namespace InternWay.DTOs
{
    public class AllDataForCompanyDto
    {
        [JsonPropertyName("activeListingsCount")]
        public int? NumberActiveInterns { get; set; }
      
        [JsonPropertyName("totalApplicantsCount")]
        public int? NumberTotalApplicants { get; set; }
      
        [JsonPropertyName("hiredInterns")]
        public int? NumberHiredInterns { get; set; }
        
        [JsonPropertyName("activeListings")]
        public List<InternshipDataDto>? ActiveInterns { get; set; } 
        public List<ApplicantDataDto>? RecentApplicants { get; set; } 


    }
}
