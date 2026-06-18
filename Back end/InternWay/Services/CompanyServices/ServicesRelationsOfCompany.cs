using InternWay.Models.company_schema;
using Microsoft.EntityFrameworkCore;

namespace InternWay.Services.CompanyServices
{
    public class ServicesRelationsOfCompany
    {
        private readonly InternShipWayDB internShipWay;

        public ServicesRelationsOfCompany(InternShipWayDB internShipWay)
        {
            this.internShipWay = internShipWay;
        }
       
        public async Task<(List<int>, int statusCode)> AddSkills(List<string> Skills)
        {
            if (Skills.Any())
            {
                var InsertSkills = Skills.Select(s => s.Trim().ToLower()).Distinct().ToList();

                var existingSkills = await internShipWay.Skills
                                 .Where(E => InsertSkills.Contains(E.Skill_Name)).ToListAsync();

                var newSkills = InsertSkills.Where(name => !existingSkills.Any(s => s.Skill_Name == name))
                                           .Select(name => new Skill { Skill_Name = name })
                                           .ToList();
                if (newSkills.Any())
                {
                    await internShipWay.Skills.AddRangeAsync(newSkills);
                    var result = await internShipWay.SaveChangesAsync();
                    if (result == 0)
                        return (new List<int>(), 500);

                }
               
                var allSkills = existingSkills.Concat(newSkills).ToList();

                return (allSkills.Select(e => e.Skill_Id).ToList(), 200);

            }
            return (new List<int>(), 400);
        }
    }
}
