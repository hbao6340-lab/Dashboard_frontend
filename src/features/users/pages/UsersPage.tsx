// Users Page — admin/developer create + modify users
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Loader2, Pencil, KeyRound, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/features/auth/AuthContext'
import { userApi } from '@/services/userApi'
import { toast } from 'sonner'

const ROLE_LABELS: Record<string, string> = { DEVELOPER: 'Lập trình viên', ADMINISTRATOR: 'Quản trị', USER: 'Người dùng' }

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const canManage = currentUser && ['ADMINISTRATOR', 'DEVELOPER'].includes(currentUser.role)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [resetting, setResetting] = useState<any | null>(null)
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '', role: 'USER', departmentName: '', position: '', phone: '' })
  const [editForm, setEditForm] = useState({ fullName: '', email: '', departmentName: '', position: '', phone: '', role: '', status: '' })
  const [newPassword, setNewPassword] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users', search, page],
    queryFn: () => userApi.getUsers({ search, page, limit: 20 }),
  })
  const invalidate = () => { queryClient.invalidateQueries({ queryKey: ['users'] }); refetch() }

  const createMutation = useMutation({
    mutationFn: () => {
      const { departmentName, ...rest } = form
      return userApi.createUser({ ...rest, departmentName: departmentName.trim() || undefined })
    },
    onSuccess: () => { toast.success('Đã tạo người dùng'); setShowCreate(false); setForm({ username: '', email: '', password: '', fullName: '', role: 'USER', departmentName: '', position: '', phone: '' }); invalidate() },
    onError: (e: any) => toast.error(e.message || 'Tạo người dùng thất bại'),
  })

  const updateMutation = useMutation({
    mutationFn: () => {
      const payload: any = {}
      if (editForm.fullName) payload.fullName = editForm.fullName
      if (editForm.email) payload.email = editForm.email
      payload.departmentName = editForm.departmentName
      if (editForm.position) payload.position = editForm.position
      if (editForm.phone) payload.phone = editForm.phone
      if (editForm.role) payload.role = editForm.role
      if (editForm.status) payload.status = editForm.status
      return userApi.updateUser(editing.id, payload)
    },
    onSuccess: () => { toast.success('Đã cập nhật người dùng'); setEditing(null); invalidate() },
    onError: (e: any) => toast.error(e.message || 'Cập nhật thất bại'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'INACTIVE' | 'DISABLED' }) => userApi.toggleStatus(id, status),
    onSuccess: () => { toast.success('Đã cập nhật trạng thái'); invalidate() },
    onError: (e: any) => toast.error(e.message || 'Cập nhật trạng thái thất bại'),
  })

  const resetMutation = useMutation({
    mutationFn: () => userApi.resetPassword(resetting.id, newPassword),
    onSuccess: () => { toast.success('Đã đặt lại mật khẩu'); setResetting(null); setNewPassword('') },
    onError: (e: any) => toast.error(e.message || 'Đặt lại mật khẩu thất bại'),
  })

  if (!canManage) {
    return <div className="text-center text-muted-foreground py-12">Chỉ quản trị viên và lập trình viên mới được quản lý người dùng.</div>
  }

  const users = (data as any)?.data?.users ?? []
  const pagination = (data as any)?.data?.pagination

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Người dùng</h1>
          <p className="text-muted-foreground">Tạo mới và quản lý người dùng (quản trị / lập trình viên)</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 max-w-sm">
            <Input placeholder="Tìm kiếm theo tên, email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
            <Button variant="outline" onClick={() => refetch()}><Search className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Danh sách người dùng</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên đăng nhập</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Đơn vị</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-40">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.username}<p className="text-xs text-muted-foreground">{u.email}</p></TableCell>
                      <TableCell>{u.fullName}<p className="text-xs text-muted-foreground">{u.position || ''}</p></TableCell>
                      <TableCell className="text-sm">{u.department?.name || '—'}</TableCell>
                      <TableCell><Badge variant="outline">{ROLE_LABELS[u.role] ?? u.role}</Badge></TableCell>
                      <TableCell><Badge className={u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>{u.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" title="Sửa" onClick={() => { setEditing(u); setEditForm({ fullName: u.fullName, email: u.email, departmentName: u.department?.name || '', position: u.position || '', phone: u.phone || '', role: u.role, status: u.status }) }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Đặt lại mật khẩu" onClick={() => setResetting(u)}>
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title={u.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'} onClick={() => statusMutation.mutate({ id: u.id, status: u.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' })}>
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">Trang {pagination.page}/{pagination.totalPages} ({pagination.total})</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Trước</Button>
                <Button variant="outline" size="sm" disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Sau</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Thêm người dùng mới</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Tên đăng nhập *</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="vd: kp36.tanhung" /></div>
            <div><Label>Họ tên *</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
            <div><Label>Email *</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Mật khẩu * (tối thiểu 8 ký tự)</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Vai trò</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Người dùng</SelectItem>
                    <SelectItem value="ADMINISTRATOR">Quản trị</SelectItem>
                    {currentUser?.role === 'DEVELOPER' && <SelectItem value="DEVELOPER">Lập trình viên</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Chức vụ</Label><Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
            </div>
            <div>
              <Label>Đơn vị</Label>
              <Input value={form.departmentName} onChange={(e) => setForm({ ...form, departmentName: e.target.value })} placeholder="Nhập tên đơn vị, vd: Đoàn Tân Hưng" />
            </div>
            <div><Label>Số điện thoại</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>Tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Sửa người dùng: {editing?.username}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Họ tên</Label><Input value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
            <div>
              <Label>Đơn vị</Label>
              <Input value={editForm.departmentName} onChange={(e) => setEditForm({ ...editForm, departmentName: e.target.value })} placeholder="Nhập tên đơn vị, để trống để gỡ" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Chức vụ</Label><Input value={editForm.position} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} /></div>
              <div><Label>Số điện thoại</Label><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Vai trò</Label>
                <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Người dùng</SelectItem>
                    <SelectItem value="ADMINISTRATOR">Quản trị</SelectItem>
                    {currentUser?.role === 'DEVELOPER' && <SelectItem value="DEVELOPER">Lập trình viên</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Trạng thái</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                    <SelectItem value="DISABLED">DISABLED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Hủy</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset password dialog */}
      <Dialog open={!!resetting} onOpenChange={(o) => !o && setResetting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Đặt lại mật khẩu: {resetting?.username}</DialogTitle></DialogHeader>
          <div><Label>Mật khẩu mới (tối thiểu 8 ký tự)</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetting(null)}>Hủy</Button>
            <Button onClick={() => resetMutation.mutate()} disabled={resetMutation.isPending || newPassword.length < 8}>Đặt lại</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
