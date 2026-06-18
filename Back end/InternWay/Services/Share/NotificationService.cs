using InternWay.Hubs;
using InternWay.IServices;
using InternWay.Models.auth_schema;
using InternWay.DTOs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace InternWay.Services
{
    public class NotificationService : INotificationService
    {
        private readonly InternShipWayDB _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(InternShipWayDB context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task CreateAndSendNotificationAsync(int userId, string title, string message, string type, int? relatedEntityId = null)
        {
            var notification = new Notification
            {
                User_Id = userId,
                Title = title,
                Message = message,
                Type = type,
                RelatedEntityId = relatedEntityId,
                Create_at = DateTime.UtcNow,
                Is_Read = false
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            var notificationDto = new NotificationDto
            {
                NotificationId = notification.Notification_Id,
                Title = notification.Title,
                Message = notification.Message,
                Type = notification.Type,
                RelatedEntityId = notification.RelatedEntityId,
                CreatedAt = notification.Create_at,
                IsRead = notification.Is_Read
            };

            // Push to the specific user. Requires user ID mapping in SignalR (e.g., using ClaimTypes.NameIdentifier).
            await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", notificationDto);
        }

        public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(int userId)
        {
            return await _context.Notifications
                .Where(n => n.User_Id == userId)
                .OrderByDescending(n => n.Create_at)
                .Select(n => new NotificationDto
                {
                    NotificationId = n.Notification_Id,
                    Title = n.Title,
                    Message = n.Message,
                    Type = n.Type,
                    RelatedEntityId = n.RelatedEntityId,
                    CreatedAt = n.Create_at,
                    IsRead = n.Is_Read
                })
                .ToListAsync();
        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _context.Notifications
                .CountAsync(n => n.User_Id == userId && !n.Is_Read);
        }

        public async Task MarkAsReadAsync(int notificationId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification != null && !notification.Is_Read)
            {
                notification.Is_Read = true;
                await _context.SaveChangesAsync();
            }
        }

        public async Task MarkAllAsReadAsync(int userId)
        {
            var unreadNotifications = await _context.Notifications
                .Where(n => n.User_Id == userId && !n.Is_Read)
                .ToListAsync();

            if (unreadNotifications.Any())
            {
                foreach (var n in unreadNotifications)
                {
                    n.Is_Read = true;
                }
                await _context.SaveChangesAsync();
            }
        }
    }
}
