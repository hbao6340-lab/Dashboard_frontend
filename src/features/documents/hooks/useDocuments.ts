// Document Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentApi, categoryApi } from '@/services/documentApi'
import type { Document, DocumentAssignment, DocumentVersion, Category } from '@/types/document'
import { toast } from 'sonner'

// Query keys
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (params: any) => [...documentKeys.lists(), params] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  versions: (id: string) => [...documentKeys.detail(id), 'versions'] as const,
  assignments: (id: string) => [...documentKeys.detail(id), 'assignments'] as const,
}

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryKeys.all, 'list'] as const,
}

// Document hooks
export function useDocuments(params?: any) {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => documentApi.getDocuments(params),
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentApi.getDocument(id),
    enabled: !!id,
  })
}

export function useDocumentVersions(id: string) {
  return useQuery({
    queryKey: documentKeys.versions(id),
    queryFn: () => documentApi.getVersions(id),
    enabled: !!id,
  })
}

export function useDocumentAssignments(id: string) {
  return useQuery({
    queryKey: documentKeys.assignments(id),
    queryFn: () => documentApi.getAssignments(id),
    enabled: !!id,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => categoryApi.getCategories(),
  })
}

// Mutations
export function useUploadDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => documentApi.uploadDocument(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() })
      toast.success('Đã tải văn bản lên')
    },
    onError: (error: any) => toast.error(error.message || 'Tải văn bản thất bại'),
  })
}

export function useUpdateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Document> }) => documentApi.updateDocument(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) })
      toast.success('Đã cập nhật văn bản')
    },
    onError: (error: any) => toast.error(error.message || 'Cập nhật văn bản thất bại'),
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => documentApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() })
      toast.success('Đã lưu trữ văn bản')
    },
    onError: (error: any) => toast.error(error.message || 'Lưu trữ văn bản thất bại'),
  })
}

export function useAssignDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => documentApi.assignDocument(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.assignments(id) })
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) })
      toast.success('Đã giao văn bản')
    },
    onError: (error: any) => toast.error(error.message || 'Giao văn bản thất bại'),
  })
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, assignmentId, data }: { id: string; assignmentId: string; data: any }) =>
      documentApi.updateAssignment(id, assignmentId, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.assignments(id) })
      toast.success('Đã cập nhật phân công')
    },
    onError: (error: any) => toast.error(error.message || 'Cập nhật phân công thất bại'),
  })
}

export function useCreateVersion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) => documentApi.createVersion(id, formData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.versions(id) })
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) })
      toast.success('Đã tạo phiên bản mới')
    },
    onError: (error: any) => toast.error(error.message || 'Tạo phiên bản thất bại'),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => categoryApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() })
      toast.success('Đã tạo lĩnh vực')
    },
    onError: (error: any) => toast.error(error.message || 'Tạo lĩnh vực thất bại'),
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) => categoryApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() })
      toast.success('Đã cập nhật lĩnh vực')
    },
    onError: (error: any) => toast.error(error.message || 'Cập nhật lĩnh vực thất bại'),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() })
      toast.success('Đã xóa lĩnh vực')
    },
    onError: (error: any) => toast.error(error.message || 'Xóa lĩnh vực thất bại'),
  })
}