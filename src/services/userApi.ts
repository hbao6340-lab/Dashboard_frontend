// User API Service (admin/developer create + modify, all roles read)
import { api } from '@/services/api'
import type { User, Department } from '@/types/user'

export interface UsersResponse {
  success: boolean
  data: {
    users: User[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
  }
}

export const userApi = {
  getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string; departmentId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') searchParams.append(key, String(value))
      })
    }
    return api.get<UsersResponse>(`/users?${searchParams.toString()}`)
  },
  getUser: (id: string) => api.get<{ success: boolean; data: { user: User } }>(`/users/${id}`),
  createUser: (data: { username: string; email: string; password: string; fullName: string; role?: string; departmentId?: string; position?: string; phone?: string }) =>
    api.post<{ success: boolean; data: { user: User } }>('/users', data),
  updateUser: (id: string, data: Partial<User>) =>
    api.patch<{ success: boolean; data: { user: User } }>(`/users/${id}`, data),
  toggleStatus: (id: string, status: 'ACTIVE' | 'INACTIVE' | 'DISABLED') =>
    api.patch<{ success: boolean; data: { user: User } }>(`/users/${id}/status`, { status }),
  resetPassword: (id: string, newPassword: string) =>
    api.post<{ success: boolean; message: string }>(`/users/${id}/reset-password`, { newPassword }),
  getDepartments: () => api.get<{ success: boolean; data: { departments: Department[] } }>('/users/departments'),
}
