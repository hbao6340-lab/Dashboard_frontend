// Calendar Page — full month grid (LMS-style). Deadlines from documents/tasks
// assigned by admins appear here with brief details.
import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Loader2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { calendarApi } from '@/services/calendarApi'
import { formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'

const TYPE_LABELS: Record<string, string> = { TASK: 'Nhiệm vụ', MEETING: 'Họp', DEADLINE: 'Hạn xử lý', REPORT: 'Báo cáo', CUSTOM: 'Khác' }
const TYPE_COLORS: Record<string, string> = { TASK: '#3B82F6', MEETING: '#8B5CF6', DEADLINE: '#EF4444', REPORT: '#10B981', CUSTOM: '#6B7280' }
const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

export function CalendarPage() {
  const queryClient = useQueryClient()
  const today = new Date()
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [selected, setSelected] = useState<Date>(today)
  const [typeFilter, setTypeFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', startAt: '', endAt: '', type: 'MEETING' })

  const monthStart = useMemo(() => new Date(cursor.y, cursor.m, 1), [cursor])
  const monthEnd = useMemo(() => new Date(cursor.y, cursor.m + 1, 0, 23, 59, 59), [cursor])

  // 42 cells, week starts Monday
  const cells = useMemo(() => {
    const lead = (monthStart.getDay() + 6) % 7
    return Array.from({ length: 42 }, (_, i) => new Date(cursor.y, cursor.m, 1 - lead + i))
  }, [cursor, monthStart])

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['calendar', cursor.y, cursor.m, typeFilter],
    queryFn: () => calendarApi.getEvents({
      start: new Date(cursor.y, cursor.m, 1).toISOString(),
      end: monthEnd.toISOString(),
      type: typeFilter || undefined,
    }),
  })

  const events: any[] = (data as any)?.data?.events ?? []
  const byDay = useMemo(() => {
    const map = new Map<string, any[]>()
    for (const e of events) {
      const k = dayKey(new Date(e.startAt))
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(e)
    }
    for (const list of map.values()) list.sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt))
    return map
  }, [events])

  const selectedEvents = byDay.get(dayKey(selected)) ?? []

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

  const moveMonth = (dir: number) => {
    const d = new Date(cursor.y, cursor.m + dir, 1)
    setCursor({ y: d.getFullYear(), m: d.getMonth() })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lịch công tác</h1>
          <p className="text-muted-foreground">Toàn bộ lịch theo tháng — hạn xử lý được giao hiển thị chi tiết</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" /> Thêm sự kiện</Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Month grid */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Tháng {cursor.m + 1}, {cursor.y}</CardTitle>
            <div className="flex items-center gap-1">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveMonth(-1)}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" className="h-8" onClick={() => { const t = new Date(); setCursor({ y: t.getFullYear(), m: t.getMonth() }); setSelected(t) }}>Hôm nay</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveMonth(1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <>
                <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
                  {WEEKDAYS.map((d) => <div key={d} className="py-2">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((day, i) => {
                    const inMonth = day.getMonth() === cursor.m
                    const isToday = sameDay(day, today)
                    const isSel = sameDay(day, selected)
                    const dayEvents = byDay.get(dayKey(day)) ?? []
                    return (
                      <button
                        key={i}
                        onClick={() => setSelected(day)}
                        className={cn(
                          'min-h-[64px] sm:min-h-[84px] rounded-lg border p-1 text-left align-top transition-colors',
                          inMonth ? 'bg-card hover:bg-accent/50' : 'bg-muted/40 text-muted-foreground',
                          isSel && 'ring-2 ring-primary',
                        )}
                      >
                        <span className={cn(
                          'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                          isToday && 'bg-primary text-primary-foreground',
                        )}>
                          {day.getDate()}
                        </span>
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 3).map((e: any) => (
                            <div
                              key={e.id}
                              className="truncate rounded px-1 py-0.5 text-[11px] leading-tight text-white"
                              style={{ backgroundColor: e.color || TYPE_COLORS[e.type] || '#6B7280' }}
                              title={`${e.title}${e.description ? ' — ' + e.description : ''}`}
                            >
                              {e.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <p className="text-[11px] text-muted-foreground">+{dayEvents.length - 3} nữa</p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Selected day detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selected.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Không có việc nào trong ngày này.</p>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map((e: any) => (
                  <div key={e.id} className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{e.title}</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => deleteMutation.mutate(e.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge style={{ backgroundColor: (e.color || TYPE_COLORS[e.type] || '#6B7280') + '20', color: e.color || TYPE_COLORS[e.type] }}>
                        {TYPE_LABELS[e.type] ?? e.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {e.allDay ? 'Cả ngày' : new Date(e.startAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        {e.user ? ` • ${e.user.fullName}` : ''}
                      </span>
                    </div>
                    {e.description && <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">Hạn: {formatDate(e.startAt)}</p>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>Tải lại</Button>
          </CardContent>
        </Card>
      </div>

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
