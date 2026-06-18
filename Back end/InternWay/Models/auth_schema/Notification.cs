using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternWay.Models.auth_schema
{
    [Table("Notifications", Schema = "auth")]
    public class Notification
    {

        [Key]
        public int Notification_Id { get; set; }

        public int User_Id { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Message { get; set; }

        public string Type { get; set; } // e.g., "Application", "Session", "ProfileView"

        public int? RelatedEntityId { get; set; } // ID of the related entity for UI navigation

        public DateTime Create_at { get; set; } = DateTime.UtcNow;

        public bool Is_Read { get; set; } = false;

        [ForeignKey("User_Id")]
        public User user { get; set; }

    }
}
