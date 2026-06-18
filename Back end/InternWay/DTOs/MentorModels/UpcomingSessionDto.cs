namespace InternWay.DTOs.MentorModels
{
    public class UpcomingSessionDto
    {
        public int SessionId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; }
        public string Topic { get; set; }
        public string FormattedDate { get; set; } 
        public string Duration { get; set; } 
        public bool CanStart { get; set; }
    }
}
