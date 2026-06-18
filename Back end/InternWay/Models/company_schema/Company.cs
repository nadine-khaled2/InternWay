using InternWay.Models.auth_schema;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Tls;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternWay.Models.company_schema
{
    [Table("Companies", Schema = "company"), Index(nameof(user_id), IsUnique = true)]
    public class Company  
    {

        public int company_id { get; set; }
        public int user_id { get; set; }
        public string company_name { get; set; }
        public string industry { get; set; }
        public string location { get; set; } 
        public string officeAddress { get; set; }
        public string description { get; set; }
        public string? website { get; set; }
        public string? LinkedIn { get; set; }
        public string? Facebook { get; set; }
        public string? Twitter { get; set; }
        public string? Instagram { get; set; }
        public int? foundedYear { get; set; }
        public User User { get; set; }
        public List<Internship> internships { get; set; }
    }
}
