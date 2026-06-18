namespace InternWay.DTOs.MentorModels
{
    public class MentorProfileDto
    {
        public int MentorId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Location { get; set; }
        public string JobTitle { get; set; }
        public int YearsExperience { get; set; }
        public string? Linkedin { get; set; }
        public string? Bio { get; set; }
        public string? CvUrl { get; set; }
        public List<MentorSlotDto> AvailableSlots { get; set; }
    }
}
