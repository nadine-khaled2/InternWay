namespace InternWay.DTOs.MentorModels
{
    public class MentorSlotDto
    {
        public int SlotId { get; set; }
        public string Day { get; set; } // e.g., "Monday, Jan 22" or just date string
        public string Date { get; set; } // YYYY-MM-DD
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public string SessionType { get; set; } // Paid / Free
        public decimal? Price { get; set; }
        public string Platform { get; set; } // e.g., "Zoom"
        public bool IsBooked { get; set; }
    }
}
