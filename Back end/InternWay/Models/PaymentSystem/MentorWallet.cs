using InternWay.Models.mentor_schema;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternWay.Models.PaymentSystem
{
    [Table("MentorWallets", Schema = "PaymentSystem")]
    public class MentorWallet
    {
        [Key]
        public int Id { get; set; }

        public int MentorId { get; set; }

        public Mentor Mentor { get; set; }

        public decimal CurrentBalance { get; set; }

        public decimal PendingBalance { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
