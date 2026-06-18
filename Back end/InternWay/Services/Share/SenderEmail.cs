using InternWay.IServices;
using System.Net;
using System.Net.Mail;


namespace InternWay.Services.Share
{
    public class SenderEmail : IAppEmailSender
    {
        private readonly string host;
        private readonly int port;
        private readonly string senderEmail;
        private readonly string senderName;
        private readonly string password;

        public SenderEmail(IConfiguration config)
        {
            var settings = config.GetSection("EmailSettings");
            host = settings["Host"];
            port = int.TryParse(settings["Port"], out var p) ? p : 587;
            senderEmail = settings["SenderEmail"];
            senderName = settings["SenderName"];
            password = settings["Password"];
        }


        public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
        {
            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(senderEmail, password),
                EnableSsl = true,
                UseDefaultCredentials = false
            };

            var mail = new MailMessage
            {
                From = new MailAddress(senderEmail, senderName),
                Subject = subject,
                Body = htmlMessage,
                IsBodyHtml = true
            };

            mail.To.Add(toEmail);
            await client.SendMailAsync(mail);
        }
    }
}