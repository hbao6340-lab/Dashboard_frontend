// Login Page — Đoàn TNCS Hồ Chí Minh theme
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/features/auth/AuthContext'
import { BrandLogos } from '@/components/BrandLogos'

const loginSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  rememberMe: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

function GoldStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 1.8l3.1 6.5 7.1.9-5.2 4.9 1.3 7-6.3-3.5-6.3 3.5 1.3-7L1.8 9.2l7.1-.9L12 1.8z" />
    </svg>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading: authLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError(null)

    try {
      await login(data.username, data.password, data.rememberMe)
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err.message || 'Truy cập thất bại. Vui lòng liên hệ quản trị viên')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-red-950 via-red-800 to-red-600 px-4 py-8">
      {/* Decorative gold stars */}
      <GoldStar className="pointer-events-none absolute -left-10 -top-10 h-64 w-64 text-yellow-400/10" />
      <GoldStar className="pointer-events-none absolute -bottom-16 -right-12 h-80 w-80 text-yellow-400/10" />
      <GoldStar className="pointer-events-none absolute right-[12%] top-[10%] h-16 w-16 text-yellow-400/20" />
      <GoldStar className="pointer-events-none absolute bottom-[14%] left-[10%] h-10 w-10 text-yellow-400/20" />

      <Card className="relative w-full max-w-md overflow-hidden border-t-4 border-t-yellow-400 shadow-2xl">
        <CardHeader className="text-center">
          <BrandLogos size="lg" className="mb-4" />
          <CardTitle className="text-2xl text-red-800">KHÔNG GIAN ĐOÀN TÂN HƯNG</CardTitle>
          <CardDescription className="font-medium text-red-700">
            HỆ THỐNG TÁC NGHIỆP ĐOÀN - HỘI - ĐỘI
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập của đồng chí"
                autoComplete="username"
                {...register('username')}
                disabled={isLoading || authLoading}
                aria-invalid={!!errors.username}
              />
              {errors.username && (
                <p className="text-sm text-destructive" role="alert">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu của đồng chí"
                  autoComplete="current-password"
                  {...register('password')}
                  disabled={isLoading || authLoading}
                  aria-invalid={!!errors.password}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive" role="alert">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">Ghi nhớ đăng nhập</span>
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || authLoading} size="lg">
              {isLoading || authLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang truy cập...
                </>
              ) : (
                'Truy cập'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Đoàn TNCS Hồ Chí Minh • Hội LHTN Việt Nam • Đội TNTP Hồ Chí Minh
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
