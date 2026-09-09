// Document Types
import { z } from 'zod'

export const DocumentStatusSchema = z.enum(['DRAFT', 'SUBMITTED', 'ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'])
export const DocumentTypeSchema = z.enum(['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX', 'TXT', 'JPG', 'JPEG', 'PNG', 'ZIP', 'OTHER'])

export interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  isActive: boolean
  sortOrder: number
}

export interface DocumentAssignment {
  id: string
  documentId: string
  userId: string
  responsibility?: string
  instructions?: string
  deadline?: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'
  status: string
  notes?: string
  assignedById: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  user: {
    id: string
    username: string
    fullName: string
    email: string
  }
  assignedBy: {
    id: string
    username: string
    fullName: string
  }
}

export interface DocumentVersion {
  id: string
  documentId: string
  version: number
  fileSize: number
  mimeType: string
  filePath: string
  originalName: string
  changeNotes?: string
  uploadedById: string
  createdAt: string
  uploadedBy: {
    id: string
    username: string
    fullName: string
  }
}

export interface Document {
  id: string
  documentNumber: string
  title: string
  description?: string
  type: string
  categoryId?: string
  status: string
  version: number
  fileSize: number
  mimeType: string
  filePath: string
  originalName: string
  confidentiality: string
  uploadedById: string
  relatedTaskId?: string
  relatedReportId?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  category?: Category
  uploadedBy: {
    id: string
    username: string
    fullName: string
  }
  versions?: DocumentVersion[]
  assignments?: DocumentAssignment[]
  tags?: Array<{ tag: { id: string; name: string; color: string } }>
  relatedTask?: { id: string; taskNumber: string; title: string; status: string }
  relatedReport?: { id: string; reportNumber: string; title: string; status: string }
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    documents: T[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}