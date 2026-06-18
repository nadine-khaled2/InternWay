using InternWay.Models.student_schema;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternWay.Models.mentor_schema
{
    [Table("Mentor_Experiences", Schema = "mentor")]
    public class Mentor_Experience
    {
        public int mentor_id { get; set; }
        public int expertise_Id { get; set; }
        public Mentor mentor { get; set; }
        public Experience Experience { get; set; }
    }
}
