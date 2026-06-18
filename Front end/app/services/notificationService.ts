import api from '../lib/api';

export interface NotificationItem {
    notificationId: number;
    title: string;
    message: string;
    type: string; // e.g., 'Session', 'Internship', 'System'
    relatedEntityId?: number;
    isRead: boolean;
    createdAt: string;
    timeAgo: string;
}

export const notificationService = {
    // 1. يجيب كل الإشعارات
    getAll: async (): Promise<NotificationItem[]> => {
        try {
            const response = await api.get('/api/Notifications');
            return response.data?.data || response.data || [];
        } catch (err: any) {
            console.warn('[getAll] Notification endpoint failed or not implemented yet. Returning empty list.', err);
            return [];
        }
    },

    // 2. يجيب عدد الإشعارات الجديدة بس
    getUnreadCount: async (): Promise<number> => {
        try {
            const response = await api.get('/api/Notifications/unread-count');
            const data = response.data?.data ?? response.data;
            return typeof data === 'number' ? data : (data?.unreadCount ?? data?.count ?? 0);
        } catch (err: any) {
            console.warn('[getUnreadCount] Notification endpoint failed or not implemented yet. Falling back to 0.', err);
            return 0;
        }
    },

    // 3. يحول إشعار معين لمقروء
    markAsRead: async (id: number): Promise<void> => {
        try {
            await api.put(`/api/Notifications/${id}/read`);
        } catch (err: any) {
            console.warn(`[markAsRead] Notification mark-read endpoint failed or not implemented yet.`, err);
        }
    },

    // 4. يخلي كل الإشعارات مقروءة
    markAllAsRead: async (): Promise<void> => {
        try {
            await api.put('/api/Notifications/read-all');
        } catch (err: any) {
            console.warn('[markAllAsRead] Notification mark-all-read endpoint failed or not implemented yet.', err);
        }
    }
};
