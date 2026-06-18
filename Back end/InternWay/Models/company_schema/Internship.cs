using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternWay.Models.company_schema
{
    [Table("Internships", Schema = "company")]
    public class Internship
    { // edit in database
        public enum Location_Type
        {
            Remote,
            Onsite,
            Hybrid
        }
        public enum Baid_Status
        {
            Paid,
            Unpaid
        }
        public enum Status
        {
            Open,
            Closed
        }

        public int Internship_Id { get; set; } 
        public int company_id { get; set; }
        public string title { get; set; }
        public string description { get; set; }
        public string requirements { get; set; }
        public int duration_months { get; set; }
        public Location_Type location_type { get; set; }
        public string location { get; set; }
        public  DateOnly application_deadline { get; set; }
        public DateTime Create_at { get; set; }
        public DateTime? Update_At { get; set; } 
        public DateTime? Revoked_At { get; set; }
        public Baid_Status paid_status { get; set; } 
        public double? priceInternship { get; set; }
        [Required]
        public Status status { get; set; }
        public bool IsClose => Revoked_At != null ||
            status == Status.Closed || 
            application_deadline < DateOnly.FromDateTime( DateTime.UtcNow);
        public Company company { get; set; }
        public List<Application> applications { get; set; }
        public List<Skill> skills { get; set; }
        public List<Internship_Skills> Internship_Skills { get; set; }
    }
}
