using InternWay.Models.company_schema;
using InternWay.Models.student_schema;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternWay.Models.mentor_schema
{
    [Table("Mentor_Skills", Schema = "mentor")]
    public class Mentor_Skill
    {
        public int mentor_id { get; set; }
        public int skill_Id { get; set; }
        public Mentor mentor { get; set; }
        public Skill skill { get; set; }
    }
}
