// Task Types
import { z } from 'zod'

export const TaskStatusSchema = z.enum(['NOT_STARTED', 'ASSIGNED', 'IN_PROGRESS', 'WAITING', 'COMPLETED', 'CANCELLED', 'OVERDUE'])
export const TaskPrioritySchema = z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL'])

export interface TaskAssignment {
  id: string
  taskId: string
  userId: string
  assignedById: string
  assignedAt: string
  startedAt?: string
  completedAt?: string
  isPrimary: boolean
  user: {
    id: string
    username: string
    fullName: string
    email: string
    department?: { name: string }
  }
  assignedBy: {
    id: string
    username: string
    fullName: string
  }
}

export interface TaskProgress {
  id: string
  taskId: string
  userId: string
  progress: number
  updateText: string
  createdAt: string
  user: {
    id: string
    username: string
    fullName: string
  }
}

export interface TaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    username: string
    fullName: string
  }
}

export interface TaskAttachment {
  id: string
  taskId: string
  fileName: string
  fileSize: number
  mimeType: string
  filePath: string
  uploadedById: string
  createdAt: string
  uploadedBy: {
    id: string
    username: string
    fullName: string
  }
}

export interface Task {
  id: string
  taskNumber: string
  title: string
  description?: string
  categoryId?: string
  departmentId?: string
  relatedDocumentId?: string
  relatedReportId?: string
  startDate?: string
  deadline?: string
  priority: string
  status: string
  progress: number
  createdById: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  deletedAt?: string
  category?: { id: string; name: string; color: string }
  department?: { id: string; name: string; code: string }
  createdBy: { id: string; username: string; fullName: string }
  assignments: TaskAssignment[]
  progressUpdates: TaskProgress[]
  comments: TaskComment[]
  attachments: TaskAttachment[]
  tags: Array<{ tag: { id: string; name: string; color: string } }>
  relatedDocument?: { id: string; documentNumber: string; title: string; status: string }
  relatedReport?: { id: string; reportNumber: string; title: string; status: string }
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    tasks: T[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}