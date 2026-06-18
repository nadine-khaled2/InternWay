using System.ComponentModel.DataAnnotations;

namespace InternWay.DTOs.StudentModels
{
    public class BookingRequestDto
    {
        [Required(ErrorMessage ="Time of session is required ")]
        public int slotId { get; set; }
        [Required(ErrorMessage = "Topic of session is required ")]
        public int topicId { get; set; }
    }
}
