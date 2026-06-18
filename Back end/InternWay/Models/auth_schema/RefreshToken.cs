using Microsoft.EntityFrameworkCore;

namespace InternWay.Models.auth_schema
{
   
    public class RefreshToken
    {
        public int Id { get; set; }   
        public int UserId { get; set; }
        public User User { get; set; }
        public string Token { get; set; }
        public DateTime CreateOn { get; set; }
        public DateTime? RevokeOn { get; set; }
        public DateTime ExpireOn { get; set; }
        public bool IsExpired => DateTime.UtcNow >= ExpireOn;
        public bool IsActive => RevokeOn == null && !IsExpired;
    }
}
