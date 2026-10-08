// Dashboard Page — live stats, charts, documents grouped by Đoàn work tags
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, FileText, CheckSquare, AlertTriangle, Clock, TrendingUp, Loader2 } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { dashboardApi } from '@/services/dashboardApi'
import { documentApi } from '@/services/documentApi'
import { useCategories } from '@/features/documents/hooks/useDocuments'
import { WORK_CATEGORIES, TASK_STATUSES, priorityLabel } from '@/lib/constants'
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Legend,
  PieChart, Pie, Cell,
} from 'recharts'

const CHART_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899', '#10B981', '#EF4444', '#6B7280']

function StatCard({ title, value, icon: Icon, iconColor }: { title: string; value: string | number; icon: React.ComponentType<{ className?: string }>; iconColor?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const { data, isLoading, isError } = useQuery({ queryKey: ['dashboard-stats'], queryFn: () => dashboardApi.getStats() })

  // Tag chips come from the live category list (same source as the upload
  // form), so a tag always resolves to the documents filed under it.
  const { data: categoriesData } = useCategories()
  const liveCategories: Array<{ id: string; name: string; color: string }> =
    (categoriesData as any)?.data?.categories ?? []
  const chips = liveCategories.length > 0
    ? liveCategories.map((c) => ({ id: c.id as string | null, name: c.name, color: c.color }))
    : WORK_CATEGORIES.map((t) => ({ id: null as string | null, name: t.name, color: t.color }))

  // Documents filtered by selected tag (resolved to category id — no fragile fetch)
  const activeCategoryId = activeTag
    ? liveCategories.find((c) => c.name === activeTag)?.id ?? null
    : null
  const { data: tagDocs } = useQuery({
    queryKey: ['dashboard-tag-docs', activeCategoryId],
    queryFn: async () => {
      const res = await documentApi.getDocuments({ categoryId: activeCategoryId!, limit: 10 })
      return (res as any).data
    },
    enabled: !!activeCategoryId,
  })

  const { data: recentDocs } = useQuery({
    queryKey: ['dashboard-recent-docs'],
    queryFn: () => documentApi.getDocuments({ limit: 8 }),
  })

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (isError || !data) {
    return <div className="text-center text-muted-foreground py-12">Không tải được dữ liệu dashboard. Vui lòng thử lại.</div>
  }

  const { stats, charts, recent } = (data as any).data

  const statCards = [
    { title: 'Tổng người dùng', value: stats.totalUsers, icon: Users, iconColor: 'text-blue-500' },
    { title: 'Văn bản', value: stats.totalDocuments, icon: FileText, iconColor: 'text-green-500' },
    { title: 'Nhiệm vụ đang thực hiện', value: stats.activeTasks, icon: CheckSquare, iconColor: 'text-orange-500' },
    { title: 'Quá hạn', value: stats.overdueTasks, icon: AlertTriangle, iconColor: 'text-red-500' },
    { title: 'Báo cáo chờ duyệt', value: stats.pendingReports, icon: Clock, iconColor: 'text-purple-500' },
    { title: 'Hoàn thành tháng này', value: stats.completedTasks, icon: TrendingUp, iconColor: 'text-emerald-500' },
  ]

  const taskStatusData = charts.tasksByStatus.map((t: any) => ({ name: TASK_STATUSES[t.status] ?? t.status, value: t.count }))
  const monthlyData = charts.monthlyActivity
  const categoryData = charts.tasksByCategory
  const workloadData = charts.userWorkload.slice(0, 8)

  const docsToShow: any[] = activeTag
    ? (tagDocs?.documents ?? [])
    : ((recentDocs as any)?.data?.documents ?? recent.documents)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
          <p className="text-muted-foreground">Danh sách văn bản và phân loại theo lĩnh vực công tác Đoàn</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => <StatCard key={stat.title} {...stat} />)}
      </div>

      {/* Work tags */}
      <Card>
        <CardHeader>
          <CardTitle>Phân loại văn bản theo lĩnh vực</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge
              className={cn('cursor-pointer', !activeTag ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}
              onClick={() => setActiveTag(null)}
            >
              Tất cả
            </Badge>
            {chips.map((t) => (
              <Badge
                key={t.name}
                className="cursor-pointer"
                style={activeTag === t.name ? { backgroundColor: t.color, color: '#fff' } : { backgroundColor: t.color + '20', color: t.color }}
                onClick={() => setActiveTag(activeTag === t.name ? null : t.name)}
              >
                {t.name}
              </Badge>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {docsToShow.length === 0 && <p className="text-sm text-muted-foreground">Chưa có văn bản trong phân loại này.</p>}
            {docsToShow.slice(0, 8).map((d: any) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{d.title}</p>
                  <p className="text-sm text-muted-foreground">{d.documentNumber ?? d.reportNumber ?? ''} • {d.createdAt ? formatDate(d.createdAt) : ''}</p>
                </div>
                <Badge variant="outline">{d.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Tổng quan trạng thái nhiệm vụ (trực tiếp)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={11} interval={0} angle={-15} dy={10} height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" name="Số lượng" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Hoạt động hàng tháng (trực tiếp)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="created" stroke="#3B82F6" name="Đã tạo" />
                  <Line type="monotone" dataKey="completed" stroke="#10B981" name="Hoàn thành" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Lĩnh vực công tác (trực tiếp)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="count" nameKey="category" innerRadius={50} outerRadius={90} label>
                    {categoryData.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Khối lượng công việc người dùng (trực tiếp)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="user" width={120} fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="activeTasks" fill="#F59E0B" name="Đang thực hiện" />
                  <Bar dataKey="completedTasks" fill="#10B981" name="Hoàn thành" />
                  <Bar dataKey="overdueTasks" fill="#EF4444" name="Quá hạn" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Nhiệm vụ gần đây</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent.tasks.slice(0, 3).map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-sm text-muted-foreground">{(t.assignees ?? []).join(', ') || t.taskNumber} • {priorityLabel(t.priority)}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{TASK_STATUSES[t.status] ?? t.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Văn bản gần đây</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent.documents.slice(0, 3).map((d: any) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{d.title}</p>
                    <p className="text-sm text-muted-foreground">{d.type} • {d.uploadedBy}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">{d.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Báo cáo gần đây</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent.reports.slice(0, 3).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-sm text-muted-foreground">{r.author}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">{r.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
