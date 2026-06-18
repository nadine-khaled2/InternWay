using System.Text.Json.Serialization;

namespace InternWay.DTOs
{
    public class LoginResponseDto
    {
        public string token { get; set; }
        public bool isAuthenticated { get; set; }
        public string message { get; set; }
        [JsonIgnore]
        public string refreshToken { get; set; }
        public DateTime refreshTokenexpiredAt { get; set; }

    }
}
