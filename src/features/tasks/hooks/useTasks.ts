// Task Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '@/services/taskApi'
import type { Task, TaskAssignment, TaskProgress, TaskComment } from '@/types/task'
import { toast } from 'sonner'

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params: any) => [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
}

export function useTasks(params?: any) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => taskApi.getTasks(params),
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => taskApi.getTask(id),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => taskApi.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      toast.success('Task created successfully')
    },
    onError: (error: any) => toast.error(error.message || 'Failed to create task'),
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => taskApi.updateTask(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) })
      toast.success('Task updated successfully')
    },
    onError: (error: any) => toast.error(error.message || 'Failed to update task'),
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      toast.success('Task cancelled successfully')
    },
    onError: (error: any) => toast.error(error.message || 'Failed to cancel task'),
  })
}

export function useAssignTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { userId: string; isPrimary?: boolean } }) => taskApi.assignTask(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) })
      toast.success('Task assigned successfully')
    },
    onError: (error: any) => toast.error(error.message || 'Failed to assign task'),
  })
}

export function useUpdateProgress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { progress: number; updateText: string } }) => taskApi.updateProgress(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      toast.success('Progress updated successfully')
    },
    onError: (error: any) => toast.error(error.message || 'Failed to update progress'),
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => taskApi.addComment(id, content),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) })
      toast.success('Comment added successfully')
    },
    onError: (error: any) => toast.error(error.message || 'Failed to add comment'),
  })
}