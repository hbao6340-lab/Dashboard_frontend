// Report API Service (submit reports/issues with doc, docx, pdf attachments)
import { api } from '@/services/api'

export interface Report {
  id: string
  reportNumber: string
  title: string
  type: 'TASK_SPECIFIC' | 'MONTHLY' | 'GENERAL'
  status: string
  subject?: string
  summary?: string
  content?: string
  author?: { id: string; username: string; fullName: string }
  category?: { id: string; name: string; color: string }
  createdAt: string
  submittedAt?: string
}

export const reportApi = {
  getReports: (params?: { page?: number; limit?: number; search?: string; type?: string; status?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') searchParams.append(key, String(value))
      })
    }
    return api.get<{ success: boolean; data: { reports: Report[]; pagination: { page: number; limit: number; total: number; totalPages: number } } }>(
      `/reports?${searchParams.toString()}`,
    )
  },
  getReport: (id: string) => api.get<{ success: boolean; data: { report: any } }>(`/reports/${id}`),
  createReport: (data: { title: string; type: string; categoryId?: string; subject?: string; summary?: string; content?: string; workCompleted?: string; results?: string; problems?: string; recommendations?: string; reportingMonth?: number; reportingYear?: number }) =>
    api.post<{ success: boolean; data: { report: Report } }>('/reports', data),
  updateReport: (id: string, data: any) => api.patch<{ success: boolean; data: { report: Report } }>(`/reports/${id}`, data),
  submitReport: (id: string) => api.post<{ success: boolean; data: { report: Report } }>(`/reports/${id}/submit`, {}),
  reviewReport: (id: string, data: { status: string; comments?: string }) =>
    api.post<{ success: boolean; data: { report: Report } }>(`/reports/${id}/review`, data),
  // Attachments (doc, docx, pdf, xls, xlsx, txt, jpg, png, zip)
  uploadAttachment: async (id: string, file: File) => {
    const base = (import.meta as any).env?.VITE_API_URL || '/api'
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${base}/reports/${id}/attachments`, { method: 'POST', body: formData, credentials: 'include' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || 'Tải tệp đính kèm thất bại')
    return data
  },
  getAttachments: (id: string) => api.get<{ success: boolean; data: { attachments: Array<{ id: string; fileName: string; fileSize: string; mimeType: string; createdAt: string }> } }>(`/reports/${id}/attachments`),
}
