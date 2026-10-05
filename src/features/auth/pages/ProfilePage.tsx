// Profile Page — account info + change password
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Loader2, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/features/auth/AuthContext'
import { authApi } from '@/services/api'
import { getInitials } from '@/lib/utils'
import { toast } from 'sonner'

const ROLE_LABELS: Record<string, string> = { DEVELOPER: 'Developer', ADMINISTRATOR: 'Quản trị', USER: 'Người dùng' }

export function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const changeMutation = useMutation({
    mutationFn: () => authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Đã đổi mật khẩu')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      refreshUser()
    },
    onError: (e: any) => toast.error(e.message || 'Đổi mật khẩu thất bại'),
  })

  const handleChange = () => {
    if (newPassword.length < 8) { toast.error('Mật khẩu mới tối thiểu 8 ký tự'); return }
    if (newPassword !== confirmPassword) { toast.error('Mật khẩu nhập lại không khớp'); return }
    changeMutation.mutate()
  }

  if (!user) {
    return <div className="text-center text-muted-foreground py-12">Chưa đăng nhập.</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground">Thông tin tài khoản của đồng chí</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Thông tin tài khoản</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                <AvatarFallback className="text-lg">{getInitials(user.fullName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl font-semibold">{user.fullName}</p>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                <Badge variant="outline" className="mt-1">{ROLE_LABELS[user.role] ?? user.role}</Badge>
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd className="font-medium">{user.email}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Đơn vị</dt><dd className="font-medium">{user.department?.name ?? '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Chức vụ</dt><dd className="font-medium">{user.position || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Số điện thoại</dt><dd className="font-medium">{user.phone || '—'}</dd></div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Đổi mật khẩu</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Mật khẩu hiện tại</Label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
            <div><Label>Mật khẩu mới (tối thiểu 8 ký tự)</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
            <div><Label>Nhập lại mật khẩu mới</Label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
            <Button onClick={handleChange} disabled={changeMutation.isPending || !currentPassword || !newPassword}>
              {changeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Đổi mật khẩu
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
