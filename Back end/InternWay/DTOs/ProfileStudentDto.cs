using System.ComponentModel.DataAnnotations;

namespace InternWay.DTOs
{
    public class ProfileStudentDto
    {
        
       
        public string fullName { get; set; }
        public string email { get; set; }
        public string phone { get; set; }

        public string? location { get; set; }
        public string university { get; set; }
      
        public string college { get; set; }
       
        public string major { get; set; }
       
        public string? gradYear { get; set; }
        public List<string>? skills { get; set; } 
        
    }
}
