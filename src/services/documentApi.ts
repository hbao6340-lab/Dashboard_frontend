// Document API Service
import { api } from '@/services/api'
import type { Document, DocumentAssignment, DocumentVersion, PaginatedResponse, Category } from '@/types/document'

export const documentApi = {
  // Get all documents with filters
  getDocuments: (params?: {
    page?: number
    limit?: number
    search?: string
    categoryId?: string
    status?: string
    type?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return api.get<PaginatedResponse<Document>>(`/documents?${searchParams.toString()}`)
  },

  // Get single document
  getDocument: (id: string) => api.get<{ success: boolean; data: { document: Document } }>(`/documents/${id}`),

  // Upload document
  uploadDocument: (formData: FormData) => api.post<{ success: boolean; data: { document: Document } }>('/documents', formData),

  // Update document
  updateDocument: (id: string, data: Partial<Document>) => api.patch<{ success: boolean; data: { document: Document } }>(`/documents/${id}`, data),

  // Delete/Archive document
  deleteDocument: (id: string) => api.delete<{ success: boolean; message: string }>(`/documents/${id}`),

  // Download document
  downloadDocument: (id: string) => {
    return fetch(`${(import.meta as any).env?.VITE_API_URL || '/api'}/documents/${id}/download`, {
      credentials: 'include',
    })
  },

  // Assign document
  assignDocument: (id: string, data: {
    userId: string
    responsibility?: string
    instructions?: string
    deadline?: string
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'
    notes?: string
  }) => api.post<{ success: boolean; data: { assignment: DocumentAssignment } }>(`/documents/${id}/assign`, data),

  // Get document assignments
  getAssignments: (id: string) => api.get<{ success: boolean; data: { assignments: DocumentAssignment[] } }>(`/documents/${id}/assignments`),

  // Update assignment status
  updateAssignment: (id: string, assignmentId: string, data: { status?: string; notes?: string }) =>
    api.patch<{ success: boolean; data: { assignment: DocumentAssignment } }>(`/documents/${id}/assignments/${assignmentId}`, data),

  // Create new version
  createVersion: (id: string, formData: FormData) =>
    api.post<{ success: boolean; data: { version: DocumentVersion } }>(`/documents/${id}/versions`, formData),

  // Get versions
  getVersions: (id: string) => api.get<{ success: boolean; data: { versions: DocumentVersion[] } }>(`/documents/${id}/versions`),

  // Download version
  downloadVersion: (id: string, versionId: string) => {
    return fetch(`${(import.meta as any).env?.VITE_API_URL || '/api'}/documents/${id}/versions/${versionId}/download`, {
      credentials: 'include',
    })
  },
}

// Category API
export const categoryApi = {
  getCategories: () => api.get<{ success: boolean; data: { categories: Category[] } }>('/categories'),
  createCategory: (data: { name: string; description?: string; color?: string; icon?: string; sortOrder?: number }) =>
    api.post<{ success: boolean; data: { category: Category } }>('/categories', data),
  updateCategory: (id: string, data: Partial<Category>) => api.patch<{ success: boolean; data: { category: Category } }>(`/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete<{ success: boolean; message: string }>(`/categories/${id}`),
}