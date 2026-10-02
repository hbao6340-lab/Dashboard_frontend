// Notification API Service
import { api } from '@/services/api'

export interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  relatedId?: string
  relatedType?: string
  isRead: boolean
  readAt?: string
  createdAt: string
}

export const notificationApi = {
  getNotifications: (params?: { page?: number; limit?: number; isRead?: boolean; type?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') searchParams.append(key, String(value))
      })
    }
    return api.get<{ success: boolean; data: { notifications: NotificationItem[]; unreadCount: number; pagination: { page: number; limit: number; total: number; totalPages: number } } }>(
      `/notifications?${searchParams.toString()}`,
    )
  },
  markRead: (id: string) => api.patch<{ success: boolean; data: { notification: NotificationItem } }>(`/notifications/${id}/read`, {}),
  markAllRead: () => api.post<{ success: boolean; message: string }>('/notifications/read-all', {}),
  deleteNotification: (id: string) => api.delete<{ success: boolean; message: string }>(`/notifications/${id}`),
}
