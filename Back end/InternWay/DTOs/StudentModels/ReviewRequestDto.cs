using System.ComponentModel.DataAnnotations;

namespace InternWay.DTOs.StudentModels
{
    public class ReviewRequestDto
    {
        [Required(ErrorMessage =" Id of session is required .")]
        public int sessionId {  get; set; }
        [Required (ErrorMessage ="Please select a rating . ") 
            , Range(maximum:5 , minimum:1 , ErrorMessage = "Rate must be between 1 and 5.")]
        public int rate { get; set; }
        public string? message { get; set; }
    }
}
