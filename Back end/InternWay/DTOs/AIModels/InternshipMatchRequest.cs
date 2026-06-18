using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace InternWay.DTOs.AIModels
{
    public class InternshipMatchRequest
    {
        [ JsonPropertyName("")]
        public InternshipDto Internship { get; set; }
       
        [ JsonPropertyName("")]
        public List<StudentForInternshipJson>? applicants { get; set; }
    }
}
