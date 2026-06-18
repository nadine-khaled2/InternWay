namespace InternWay.DTOs.StudentModels
{
    public class MentorDetailsDataForStudentDto
    {
        public int mentorId { get; set; }
        public string mentorName { get; set; }
        public string jobTitle { get; set; }
        public int yearsExperience { get; set; }
        public double avgRating { get; set; }
        public int countReviewers { get; set; }
        public string? description { get; set; }
        public List<string>? skills { get; set; }
        public List<string>? experiences { get; set; }
        public int  totalSessions { get; set; }
        public int numMenteesHired { get; set; }
        public bool IsAvailable { get; set; }
    }
}
