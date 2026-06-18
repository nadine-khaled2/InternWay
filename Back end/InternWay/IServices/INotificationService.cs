using InternWay.Models.auth_schema;
using InternWay.DTOs;

namespace InternWay.IServices
{
    public interface INotificationService
    {
        Task CreateAndSendNotificationAsync(int userId, string title, string message, string type, int? relatedEntityId = null);
        Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);
        Task MarkAsReadAsync(int notificationId);
        Task MarkAllAsReadAsync(int userId);
    }

}
