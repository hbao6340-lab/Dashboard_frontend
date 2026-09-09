// User Types
export interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: 'DEVELOPER' | 'ADMINISTRATOR' | 'USER'
  status: 'ACTIVE' | 'INACTIVE' | 'DISABLED'
  departmentId?: string
  position?: string
  phone?: string
  avatarUrl?: string
  lastLoginAt?: string
  createdAt: string
  department?: {
    id: string
    name: string
    code: string
  }
}

export interface Department {
  id: string
  name: string
  code: string
  description?: string
  parentId?: string
  isActive: boolean
}

export interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  isActive: boolean
  sortOrder: number
}

export interface Tag {
  id: string
  name: string
  description?: string
  color: string
  isActive: boolean
}