// Calendar API Service
import { api } from '@/services/api'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startAt: string
  endAt: string
  allDay: boolean
  type: 'TASK' | 'MEETING' | 'DEADLINE' | 'REPORT' | 'CUSTOM'
  relatedId?: string
  color?: string
  user?: { id: string; username: string; fullName: string }
}

export const calendarApi = {
  getEvents: (params?: { start?: string; end?: string; type?: string; userId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') searchParams.append(key, String(value))
      })
    }
    return api.get<{ success: boolean; data: { events: CalendarEvent[] } }>(`/calendar?${searchParams.toString()}`)
  },
  createEvent: (data: { title: string; description?: string; startAt: string; endAt: string; allDay?: boolean; type?: string; relatedId?: string; color?: string }) =>
    api.post<{ success: boolean; data: { event: CalendarEvent } }>('/calendar', data),
  updateEvent: (id: string, data: Partial<CalendarEvent>) =>
    api.patch<{ success: boolean; data: { event: CalendarEvent } }>(`/calendar/${id}`, data),
  deleteEvent: (id: string) => api.delete<{ success: boolean; message: string }>(`/calendar/${id}`),
}
