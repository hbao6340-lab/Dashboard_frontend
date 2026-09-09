// Main App Component
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/features/auth/AuthContext'
import { Layout } from '@/layouts/MainLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { DocumentsPage } from '@/features/documents/pages/DocumentsPage'
import { TasksPage } from '@/features/tasks/pages/TasksPage'
import { CalendarPage } from '@/features/calendar/pages/CalendarPage'
import { ReportsPage } from '@/features/reports/pages/ReportsPage'
import { UsersPage } from '@/features/users/pages/UsersPage'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage'
import { ProfilePage } from '@/features/auth/pages/ProfilePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Admin/Developer only routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMINISTRATOR', 'DEVELOPER']}><Layout /></ProtectedRoute>}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
          
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App