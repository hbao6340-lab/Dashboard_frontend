// Tasks Page — live tasks with categories, priorities, progress
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { taskApi } from '@/services/taskApi'
import { categoryApi } from '@/services/documentApi'
import { PRIORITIES, TASK_STATUSES } from '@/lib/constants'
import { toast } from 'sonner'

export function TasksPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [progressFor, setProgressFor] = useState<any | null>(null)
  const [form, setForm] = useState({ title: '', description: '', categoryId: '', deadline: '', priority: 'NORMAL' })
  const [progress, setProgress] = useState({ value: 50, text: '' })

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tasks', search, status],
    queryFn: () => taskApi.getTasks({ search: search || undefined, status: status || undefined, limit: 30 }),
  })
  const { data: cats } = useQuery({ queryKey: ['task-categories'], queryFn: () => categoryApi.getCategories() })

  const createMutation = useMutation({
    mutationFn: () =>
      taskApi.createTask({
        title: form.title,
        description: form.description || undefined,
        categoryId: form.categoryId || undefined,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
        priority: form.priority,
      }),
    onSuccess: () => { toast.success('Đã tạo nhiệm vụ'); setShowCreate(false); setForm({ title: '', description: '', categoryId: '', deadline: '', priority: 'NORMAL' }); queryClient.invalidateQueries({ queryKey: ['tasks'] }) },
    onError: (e: any) => toast.error(e.message || 'Tạo thất bại'),
  })

  const progressMutation = useMutation({
    mutationFn: () => taskApi.updateProgress(progressFor.id, { progress: progress.value, updateText: progress.text }),
    onSuccess: () => { toast.success('Đã cập nhật tiến độ'); setProgressFor(null); queryClient.invalidateQueries({ queryKey: ['tasks'] }) },
    onError: (e: any) => toast.error(e.message || 'Cập nhật thất bại'),
  })

  const tasks = (data as any)?.data?.tasks ?? (data as any)?.data ?? []
  const categories = (cats as any)?.data?.categories ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nhiệm vụ</h1>
          <p className="text-muted-foreground">Theo dõi tiến độ và hạn xử lý</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" /> Thêm nhiệm vụ</Button>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-wrap gap-2 items-end">
          <div><Label>Tìm kiếm</Label><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tên nhiệm vụ..." className="w-[220px]" /></div>
          <div>
            <Label>Trạng thái</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Tất cả" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                {Object.entries(TASK_STATUSES).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => refetch()}>Tải lại</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Danh sách nhiệm vụ</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Chưa có nhiệm vụ nào</div>
          ) : (
            <div className="space-y-2">
              {tasks.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.taskNumber} • {t.category?.name ?? ''} • Tiến độ {t.progress ?? 0}% • Ưu tiên {PRIORITIES.find((p) => p.value === t.priority)?.label ?? t.priority}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{TASK_STATUSES[t.status] ?? t.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => { setProgressFor(t); setProgress({ value: t.progress ?? 0, text: '' }) }}>Cập nhật tiến độ</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Thêm nhiệm vụ</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Tiêu đề *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Mô tả</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Lĩnh vực</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Không</SelectItem>
                    {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ưu tiên</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Hạn xử lý</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.title}>Tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!progressFor} onOpenChange={(o) => !o && setProgressFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Cập nhật tiến độ: {progressFor?.title}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Tiến độ (%)</Label><Input type="number" min={0} max={100} value={progress.value} onChange={(e) => setProgress({ ...progress, value: Number(e.target.value) })} /></div>
            <div><Label>Ghi chú *</Label><Textarea value={progress.text} onChange={(e) => setProgress({ ...progress, text: e.target.value })} rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProgressFor(null)}>Hủy</Button>
            <Button onClick={() => progressMutation.mutate()} disabled={progressMutation.isPending || !progress.text}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
