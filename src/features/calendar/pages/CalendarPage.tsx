// Calendar Page — deadlines from assigned documents + custom events
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { calendarApi } from '@/services/calendarApi'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

const TYPE_LABELS: Record<string, string> = { TASK: 'Nhiệm vụ', MEETING: 'Họp', DEADLINE: 'Hạn xử lý', REPORT: 'Báo cáo', CUSTOM: 'Khác' }

export function CalendarPage() {
  const queryClient = useQueryClient()
  const [typeFilter, setTypeFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', startAt: '', endAt: '', type: 'MEETING' })

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['calendar', typeFilter],
    queryFn: () => calendarApi.getEvents(typeFilter ? { type: typeFilter } : undefined),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      calendarApi.createEvent({
        title: form.title,
        description: form.description || undefined,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt || form.startAt).toISOString(),
        type: form.type,
      }),
    onSuccess: () => { toast.success('Đã tạo sự kiện'); setShowCreate(false); setForm({ title: '', description: '', startAt: '', endAt: '', type: 'MEETING' }); queryClient.invalidateQueries({ queryKey: ['calendar'] }) },
    onError: (e: any) => toast.error(e.message || 'Tạo sự kiện thất bại'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => calendarApi.deleteEvent(id),
    onSuccess: () => { toast.success('Đã xóa sự kiện'); queryClient.invalidateQueries({ queryKey: ['calendar'] }) },
    onError: (e: any) => toast.error(e.message || 'Xóa thất bại'),
  })

  const events = (data as any)?.data?.events ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lịch công tác</h1>
          <p className="text-muted-foreground">Hạn xử lý văn bản được giao và sự kiện chung</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" /> Thêm sự kiện</Button>
      </div>

      <Card>
        <CardContent className="pt-6 flex gap-2 items-end">
          <div>
            <Label>Loại</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Tất cả" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                {Object.entries(TYPE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => refetch()}>Tải lại</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Danh sách sự kiện / hạn xử lý</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Chưa có sự kiện nào</div>
          ) : (
            <div className="space-y-2">
              {events.map((e: any) => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{e.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(e.startAt)}{e.user ? ` • ${e.user.fullName}` : ''}{e.description ? ` • ${e.description}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{TYPE_LABELS[e.type] ?? e.type}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(e.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Thêm sự kiện</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Tiêu đề *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Mô tả</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Bắt đầu *</Label><Input type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} /></div>
              <div><Label>Kết thúc</Label><Input type="datetime-local" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} /></div>
            </div>
            <div>
              <Label>Loại</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.title || !form.startAt}>Tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
