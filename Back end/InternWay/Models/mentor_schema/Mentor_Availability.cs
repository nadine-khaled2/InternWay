using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static InternWay.Models.company_schema.Internship;

namespace InternWay.Models.mentor_schema
{
    [Table("Mentor_Availabilities", Schema = "mentor")
        , Index(nameof(mentor_id), nameof(date), nameof(start_time), IsUnique = true)]

    public class Mentor_Availability
    {

        public int Slot_Id { get; set; }
        public int mentor_id { get; set; }
        public DateOnly date { get; set; }
        public TimeOnly start_time { get; set; }
        public TimeSpan Duration { get; set; }
        public Baid_Status paid_status { get; set; } 
        public decimal priceSlot { get; set; }
        public string? Currency { get; set; } = "EGP";
        public string session_link { get; set; }  
        public bool is_booked { get; set; }
        public Mentor Mentor { get; set; }

        public List<Mentorship_Session> mentorship_Session { get; set; }
    }
}
