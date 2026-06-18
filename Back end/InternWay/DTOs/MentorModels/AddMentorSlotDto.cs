using System.ComponentModel.DataAnnotations;

namespace InternWay.DTOs.MentorModels
{
    public class AddMentorSlotDto
    {
        [Required]
        public DateOnly Date { get; set; }
        [Required]
        public TimeOnly StartTime { get; set; }
        [Required]
        public TimeSpan Duration { get; set; }
        [Required]
        public string SessionType { get; set; } // "Paid Sessions" or "Free"
        public decimal Price { get; set; } //===================== لو فري تتبعت 0 
        [Required]
        public string Platform { get; set; } // e.g., link or "Zoom" and we map it
    }
}
