// Forbidden Page
import { Link } from 'react-router-dom'
import { Lock, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-12">
          <Lock className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h1 className="mt-4 text-3xl font-bold">Không có quyền truy cập</h1>
          <p className="mt-2 text-muted-foreground">
            Đồng chí không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu cho rằng đây là nhầm lẫn.
          </p>
          <div className="mt-6 flex gap-4 justify-center">
            <Button asChild>
              <Link to="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Về trang chủ
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}