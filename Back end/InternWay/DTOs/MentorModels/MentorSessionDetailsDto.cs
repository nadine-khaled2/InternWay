namespace InternWay.DTOs.MentorModels
{
    public class MentorSessionDetailsDto
    {
        public int SessionId { get; set; }
        public StudentObjectDto Student { get; set; }
        public string Topic { get; set; }
        public string Status { get; set; } // "Pending", "Accepted", "Completed", "Rejected"
        public string StartTime { get; set; } // ISO 8601 UTC string
        public string EndTime { get; set; }   // ISO 8601 UTC string
        public string Duration { get; set; } // Keep duration if UI still uses it as a string
        public string Notes { get; set; }
    }
}
