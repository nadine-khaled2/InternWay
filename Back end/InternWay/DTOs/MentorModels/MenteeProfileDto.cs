namespace InternWay.DTOs.MentorModels
{
    public class MenteeProfileDto
    {
        public int StudentId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string University { get; set; }
        public string College { get; set; }
        public string Major { get; set; }
        public int? GraduationYear { get; set; }
        public string Location { get; set; }
        public string CvUrl { get; set; }
    }
}
