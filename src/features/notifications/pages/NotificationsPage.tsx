// Notifications Page — live notifications
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { notificationApi } from '@/services/notificationApi'
import { formatRelativeTime, cn } from '@/lib/utils'
import { toast } from 'sonner'

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications({ limit: 50 }),
    refetchInterval: 30000,
  })

  const readMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: (e: any) => toast.error(e.message || 'Đánh dấu thất bại'),
  })

  const readAllMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => { toast.success('Đã đánh dấu tất cả đã đọc'); queryClient.invalidateQueries({ queryKey: ['notifications'] }) },
    onError: (e: any) => toast.error(e.message || 'Thất bại'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationApi.deleteNotification(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: (e: any) => toast.error(e.message || 'Xóa thất bại'),
  })

  const notifications = (data as any)?.data?.notifications ?? []
  const unreadCount = (data as any)?.data?.unreadCount ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thông báo</h1>
          <p className="text-muted-foreground">{unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã được đọc'}</p>
        </div>
        <Button variant="outline" onClick={() => readAllMutation.mutate()} disabled={readAllMutation.isPending || unreadCount === 0}>
          <CheckCheck className="mr-2 h-4 w-4" /> Đánh dấu tất cả đã đọc
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Danh sách thông báo</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Chưa có thông báo nào</div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n: any) => (
                <div key={n.id} className={cn('flex items-start justify-between p-3 rounded-lg', n.isRead ? 'bg-muted/50' : 'bg-primary/5 border border-primary/20')}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{n.title}</p>
                      {!n.isRead && <Badge className="bg-primary text-primary-foreground">Mới</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(n.createdAt)}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    {!n.isRead && <Button variant="ghost" size="sm" onClick={() => readMutation.mutate(n.id)}>Đã đọc</Button>}
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(n.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4"><Button variant="outline" size="sm" onClick={() => refetch()}>Tải lại</Button></div>
        </CardContent>
      </Card>
    </div>
  )
}
