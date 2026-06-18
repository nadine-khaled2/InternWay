namespace InternWay.DTOs.MentorModels
{
    public class MentorSessionListDto
    {
        public int SessionId { get; set; }
        public string MenteeName { get; set; }
        public int MenteeId { get; set; }
        public string Topic { get; set; }
        public string Status { get; set; }
        public string FormattedDate { get; set; } // "Today, 3:00 PM"
        public string Duration { get; set; } // "1 hour"
        public bool IsUpcoming { get; set; }
        public bool CanStart { get; set; }
    }
}
