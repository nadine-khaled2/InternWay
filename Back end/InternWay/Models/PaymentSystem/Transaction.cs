using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternWay.Models.PaymentSystem
{
    public enum TransactionType
    {
        Deposit, 
        MentorEarning, 
        PlatformCut,   
        Refund
    }
    [Table("Transactions", Schema = "PaymentSystem")]
    public class Transaction
    {
        [Key]
        public int Id { get; set; }
        public int WalletId { get; set; }
        public decimal Amount { get; set; }
        public TransactionType Type { get; set; }
        public long TransactionId { get; set; }
        public int SessionId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

    }
}
