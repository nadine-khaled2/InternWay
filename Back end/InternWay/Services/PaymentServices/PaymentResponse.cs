namespace InternWay.Services.PaymentServices
{
    public class PaymentResponse
    {
        public bool Success { get; set; }
        public string? Url { get; set; }
        public string Message { get; set; }
    }
}
