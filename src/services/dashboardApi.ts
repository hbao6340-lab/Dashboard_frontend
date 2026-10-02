// Dashboard API Service
import { api } from '@/services/api'

export interface DashboardStats {
  stats: {
    totalUsers: number
    activeUsers: number
    totalDocuments: number
    totalTasks: number
    activeTasks: number
    completedTasks: number
    overdueTasks: number
    tasksDueToday: number
    tasksDueThisWeek: number
    pendingReports: number
    approvedReports: number
  }
  charts: {
    tasksByStatus: Array<{ status: string; count: number }>
    tasksByCategory: Array<{ category: string; color: string; count: number }>
    tasksByPriority: Array<{ priority: string; count: number }>
    monthlyActivity: Array<{ month: string; created: number; completed: number }>
    userWorkload: Array<{ user: string; activeTasks: number; completedTasks: number; overdueTasks: number }>
    reportStats: Array<{ status: string; count: number }>
  }
  recent: {
    tasks: Array<{ id: string; taskNumber: string; title: string; status: string; priority: string; deadline?: string; assignees: string[] }>
    documents: Array<{ id: string; documentNumber: string; title: string; type: string; status: string; uploadedBy: string; createdAt: string }>
    reports: Array<{ id: string; reportNumber: string; title: string; type: string; status: string; author: string; createdAt: string }>
  }
}

export const dashboardApi = {
  getStats: (userId?: string) => {
    const params = userId ? `?userId=${userId}` : ''
    return api.get<{ success: boolean; data: DashboardStats }>(`/dashboard/stats${params}`)
  },
}
