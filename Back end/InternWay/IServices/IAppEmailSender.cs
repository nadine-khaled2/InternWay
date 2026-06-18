namespace InternWay.IServices
{
    public interface IAppEmailSender
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlMessage);
    }
}
