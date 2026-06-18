namespace InternWay.DTOs.MentorModels
{
    public class MentorDashboardDto
    {
        public int TotalSessions { get; set; }
        public int ActiveMentees { get; set; }
        public int HoursThisMonth { get; set; }
        public double AverageRating { get; set; }
        public List<UpcomingSessionDto> UpcomingSessions { get; set; } = new List<UpcomingSessionDto>();
        public List<RecentMenteeDto> RecentMentees { get; set; } = new List<RecentMenteeDto>();
    }
}
