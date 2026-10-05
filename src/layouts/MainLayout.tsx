// Main Layout Component
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LayoutDashboard, FileText, CheckSquare, Calendar, FileQuestion, Users, Settings, Bell, LogOut, User, Menu, X } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

const navigation = [
  { name: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard, roles: ['USER', 'ADMINISTRATOR', 'DEVELOPER'] },
  { name: 'Văn bản', href: '/documents', icon: FileText, roles: ['USER', 'ADMINISTRATOR', 'DEVELOPER'] },
  { name: 'Nhiệm vụ', href: '/tasks', icon: CheckSquare, roles: ['USER', 'ADMINISTRATOR', 'DEVELOPER'] },
  { name: 'Lịch công tác', href: '/calendar', icon: Calendar, roles: ['USER', 'ADMINISTRATOR', 'DEVELOPER'] },
  { name: 'Báo cáo', href: '/reports', icon: FileQuestion, roles: ['USER', 'ADMINISTRATOR', 'DEVELOPER'] },
  { name: 'Thông báo', href: '/notifications', icon: Bell, roles: ['USER', 'ADMINISTRATOR', 'DEVELOPER'] },
  { name: 'Người dùng', href: '/users', icon: Users, roles: ['ADMINISTRATOR', 'DEVELOPER'] },
  { name: 'Cài đặt', href: '/settings', icon: Settings, roles: ['ADMINISTRATOR', 'DEVELOPER'] },
]

export function MainLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: notifData } = useQuery({
    queryKey: ['layout-unread-count'],
    queryFn: async () => {
      const res = await fetch(`${(import.meta as any).env?.VITE_API_URL || '/api'}/notifications?limit=1`, { credentials: 'include' })
      return res.json().catch(() => null)
    },
    refetchInterval: 30000,
    enabled: !!user,
  })
  const unreadCount = (notifData as any)?.data?.unreadCount ?? 0
  void location

  const filteredNav = navigation.filter(item => 
    user && item.roles.includes(user.role as any)
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-full flex-col">
          {/* Logo banner */}
          <div className="relative border-b border-border bg-gradient-to-b from-[#0e12a0] to-[#1920be] px-3 pb-3 pt-4">
            <div className="flex items-center justify-center gap-2">
              <img
                src="/logos/logo-doan.png"
                alt="Đoàn TNCS Hồ Chí Minh"
                title="Đoàn TNCS Hồ Chí Minh"
                className="h-12 w-12 rounded-full bg-white object-contain p-0.5 shadow ring-2 ring-yellow-300/70"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <img
                src="/logos/logo-hoi.png"
                alt="Hội Liên hiệp Thanh niên Việt Nam"
                title="Hội Liên hiệp Thanh niên Việt Nam"
                className="h-12 w-12 rounded-full bg-white object-contain p-0.5 shadow ring-2 ring-yellow-300/70"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <img
                src="/logos/logo-doi.png"
                alt="Đội TNTP Hồ Chí Minh"
                title="Đội TNTP Hồ Chí Minh"
                className="h-12 w-12 rounded-full bg-white object-contain p-0.5 shadow ring-2 ring-yellow-300/70"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm font-bold leading-snug text-white">Hệ thống tác nghiệp</p>
              <p className="text-xs font-semibold tracking-[0.2em] text-yellow-300">ĐOÀN - HỘI - ĐỘI</p>
            </div>
            <button
              className="absolute right-2 top-2 lg:hidden p-2 rounded-md text-white hover:bg-white/10"
              onClick={() => setSidebarOpen(false)}
              aria-label="Đóng menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Main navigation">
            {filteredNav.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="text-xs text-muted-foreground text-center">
              Đoàn Tân Hưng • v1.0.0
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          {/* Search */}
          <div className="hidden md:flex md:max-w-md">
            <div className="relative w-full">
              <span className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="search"
                placeholder="Tìm kiếm văn bản, nhiệm vụ, báo cáo..."
                className="h-9 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
                aria-label="Tìm kiếm"
              />
            </div>
          </div>

          {/* Notifications & User Menu */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/notifications')}>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatarUrl} alt={user?.fullName || ''} />
                    <AvatarFallback>{getInitials(user?.fullName || 'U')}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="px-2 py-1">
                  <p className="text-sm font-medium">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.role === 'DEVELOPER' ? 'Lập trình viên' : user?.role === 'ADMINISTRATOR' ? 'Quản trị viên' : 'Người dùng'}</p>
                </div>
                <Separator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Hồ sơ cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

// Export as Layout for backward compatibility
export { MainLayout as Layout }

// Search icon component
function Search({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}