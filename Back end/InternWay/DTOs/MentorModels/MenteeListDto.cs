namespace InternWay.DTOs.MentorModels
{
    public class MenteeListDto
    {
        public int StudentId { get; set; }
        public string FullName { get; set; }
        public string University { get; set; }
        public string Major { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public int TotalSessions { get; set; }
        public string? NextSession { get; set; }
    }
}
