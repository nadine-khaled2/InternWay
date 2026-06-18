using System.ComponentModel.DataAnnotations.Schema;

namespace InternWay.Models.company_schema
{
    [Table("Internship_Skills", Schema = "company")]
    public class Internship_Skills
    {
        public int Internship_Id { get; set; }
        public int Skill_Id { get; set; }
        public Internship Internship { get; set; }
        public Skill Skill { get; set; }
    }
}
