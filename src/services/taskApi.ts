// Task API Service
import { api } from '@/services/api'
import type { Task, TaskAssignment, TaskProgress, TaskComment, PaginatedResponse } from '@/types/task'

export const taskApi = {
  // Get all tasks with filters
  getTasks: (params?: {
    page?: number
    limit?: number
    search?: string
    categoryId?: string
    departmentId?: string
    status?: string
    priority?: string
    assignedToId?: string
    createdById?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return api.get<PaginatedResponse<Task>>(`/tasks?${searchParams.toString()}`)
  },

  // Get single task
  getTask: (id: string) => api.get<{ success: boolean; data: { task: Task } }>(`/tasks/${id}`),

  // Create task
  createTask: (data: {
    title: string
    description?: string
    categoryId?: string
    departmentId?: string
    relatedDocumentId?: string
    relatedReportId?: string
    startDate?: string
    deadline?: string
    priority?: string
    assigneeIds?: string[]
  }) => api.post<{ success: boolean; data: { task: Task } }>('/tasks', data),

  // Update task
  updateTask: (id: string, data: Partial<Task>) => api.patch<{ success: boolean; data: { task: Task } }>(`/tasks/${id}`, data),

  // Delete task
  deleteTask: (id: string) => api.delete<{ success: boolean; message: string }>(`/tasks/${id}`),

  // Assign task
  assignTask: (id: string, data: { userId: string; isPrimary?: boolean }) =>
    api.post<{ success: boolean; data: { assignment: TaskAssignment } }>(`/tasks/${id}/assign`, data),

  // Update progress
  updateProgress: (id: string, data: { progress: number; updateText: string }) =>
    api.post<{ success: boolean; message: string }>(`/tasks/${id}/progress`, data),

  // Add comment
  addComment: (id: string, content: string) =>
    api.post<{ success: boolean; data: { comment: TaskComment } }>(`/tasks/${id}/comments`, { content }),

  // Add dependency
  addDependency: (id: string, data: { dependsOnId: string; type?: string }) =>
    api.post<{ success: boolean; data: { dependency: any } }>(`/tasks/${id}/dependencies`, data),

  // Remove dependency
  removeDependency: (id: string, dependencyId: string) =>
    api.delete<{ success: boolean; message: string }>(`/tasks/${id}/dependencies/${dependencyId}`),
}