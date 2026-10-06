// Profile Page — account info + change password
import { useEffect, useState } from 'react'
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
import { userApi } from '@/services/userApi'
import { getInitials } from '@/lib/utils'
import { toast } from 'sonner'

const ROLE_LABELS: Record<string, string> = { DEVELOPER: 'Lập trình viên', ADMINISTRATOR: 'Quản trị', USER: 'Người dùng' }

export function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState<string | null>(null)
  const [profile, setProfile] = useState({ departmentName: '', position: '', phone: '' })

  // Sync editable fields when account data loads
  useEffect(() => {
    if (user) {
      setProfile({
        departmentName: user.department?.name ?? '',
        position: user.position ?? '',
        phone: user.phone ?? '',
      })
    }
  }, [user?.id])

  const emailValue = email ?? user?.email ?? ''

  const profileMutation = useMutation({
    mutationFn: () => userApi.updateUser(user!.id, {
      departmentName: profile.departmentName,
      position: profile.position || undefined,
      phone: profile.phone || undefined,
    } as any),
    onSuccess: () => {
      toast.success('Đã cập nhật thông tin')
      refreshUser()
    },
    onError: (e: any) => toast.error(e.message || 'Cập nhật thất bại'),
  })

  const emailMutation = useMutation({
    mutationFn: () => userApi.updateUser(user!.id, { email: emailValue }),
    onSuccess: () => {
      toast.success('Đã cập nhật email')
      setEmail(null)
      refreshUser()
    },
    onError: (e: any) => toast.error(e.message || 'Cập nhật email thất bại'),
  })

  const handleEmailSave = () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailValue)) { toast.error('Email không hợp lệ'); return }
    if (emailValue === user?.email) { toast.error('Email không thay đổi'); return }
    emailMutation.mutate()
  }

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
            <div className="space-y-3 text-sm">
              <div>
                <Label>Email</Label>
                <div className="flex items-center gap-2">
                  <Input type="email" value={emailValue} onChange={(e) => setEmail(e.target.value)} />
                  <Button size="sm" variant="outline" onClick={handleEmailSave} disabled={emailMutation.isPending || emailValue === user.email}>
                    {emailMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Lưu'}
                  </Button>
                </div>
              </div>
              <div>
                <Label>Đơn vị</Label>
                <Input value={profile.departmentName} onChange={(e) => setProfile({ ...profile, departmentName: e.target.value })} placeholder="Nhập tên đơn vị" />
              </div>
              <div>
                <Label>Chức vụ</Label>
                <Input value={profile.position} onChange={(e) => setProfile({ ...profile, position: e.target.value })} placeholder="Nhập chức vụ" />
              </div>
              <div>
                <Label>Số điện thoại</Label>
                <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="Nhập số điện thoại" />
              </div>
              <Button size="sm" onClick={() => profileMutation.mutate()} disabled={profileMutation.isPending}>
                {profileMutation.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />} Lưu thông tin
              </Button>
            </div>
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
