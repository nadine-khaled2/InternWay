using InternWay.Models.student_schema;

namespace InternWay.Services.StudentServices
{
    public class ServicesRelationsOfStudent
    {
        private readonly InternShipWayDB internShipWay;

        public ServicesRelationsOfStudent(InternShipWayDB internShipWay)
        {
            this.internShipWay = internShipWay;
        }
        public  async Task addExperiencesOfStudent(int studentId, List<int> ExperienceId)
        {
            List<Student_Experience> Relations = new();
            if (ExperienceId.Count <= 0)
                return;

            foreach (var ExId in ExperienceId)
            {
                var relation = new Student_Experience() { student_id = studentId, expertise_Id = ExId };
                Relations.Add(relation);
            }
            if (Relations.Count > 0)
            {
                await internShipWay.student_Experiences.AddRangeAsync(Relations);
                await internShipWay.SaveChangesAsync();

            }
        }
        public  async Task addSkillsOfStudent(int studentId, List<int> SkillId)
        {
            List<Student_Skills> Relations = new();
            if (SkillId.Count <= 0)
                return;
            foreach (var SkId in SkillId)
            {
                var relation = new Student_Skills() { student_id = studentId, skill_id = SkId };
                Relations.Add(relation);
            }
            if (Relations.Count > 0)
            {
                await internShipWay.Student_Skills.AddRangeAsync(Relations);
                await internShipWay.SaveChangesAsync();

            }
        }
    }
}
