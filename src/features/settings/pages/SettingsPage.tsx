// Settings Page
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings as SettingsIcon } from 'lucide-react'

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Căi đặt</h1>
          <p className="text-muted-foreground">Cấu hình hệ thống (quản trị / lập trình viên)</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Căi đặt hệ thống</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-3 h-64 text-muted-foreground">
            <SettingsIcon className="h-10 w-10" />
            <p>Trang cài đặt chi tiết đang được hoàn thiện.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
