using InternWay.Models.student_schema;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternWay.Models.mentor_schema
{
    [Table("Reviews", Schema = "mentor") , Index(nameof(SessionId) , IsUnique =true)]
    public class Review
    {
        [Key]
        public int Id { get; set; }
        public int StudentId { get; set; }

        public int MentorId { get; set; }
        public int SessionId { get; set; }
        public double Rating { get; set; }
        public string? Message { get; set; }
        public DateTime CreateAt { get; set; }
        public Mentorship_Session session { get; set; }
        public Student student { get; set; }
        public Mentor mentor { get; set; }

        
    } 
}
