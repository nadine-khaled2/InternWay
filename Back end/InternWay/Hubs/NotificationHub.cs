using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace InternWay.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        // Clients connect to this hub. The base Hub handles connection ID mapping natively if we use User identifiers.
        // We can add specific methods here if the client needs to invoke something on the server,
        // but typically we push from server to client using IHubContext.
        
        public override async Task OnConnectedAsync()
        {
            // You can log or track connections here if needed
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}
