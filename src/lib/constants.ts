// Shared Vietnamese labels for Đoàn Tân Hưng
export const WORK_CATEGORIES = [
  { name: 'Xây dựng, Tổ chức Đoàn', color: '#3B82F6' },
  { name: 'Tuyên truyền, Giáo dục', color: '#8B5CF6' },
  { name: 'Phong trào', color: '#F59E0B' },
  { name: 'Chuyển đổi số trong công tác Đoàn', color: '#06B6D4' },
  { name: 'Đội & Thiếu nhi', color: '#EC4899' },
  { name: 'Hội Liên hiệp Thanh niên Việt Nam', color: '#10B981' },
] as const

// 3 priority levels: Thấp / Trung bình / Cao
export const PRIORITIES = [
  { value: 'LOW', label: 'Thấp', className: 'bg-gray-100 text-gray-800' },
  { value: 'NORMAL', label: 'Trung bình', className: 'bg-blue-100 text-blue-800' },
  { value: 'HIGH', label: 'Cao', className: 'bg-red-100 text-red-800' },
] as const

export type PriorityValue = (typeof PRIORITIES)[number]['value']

export function priorityLabel(value: string): string {
  return PRIORITIES.find((p) => p.value === value)?.label ?? value
}

export function priorityClassName(value: string): string {
  return PRIORITIES.find((p) => p.value === value)?.className ?? 'bg-gray-100 text-gray-800'
}

export const DOCUMENT_STATUSES: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Nháp', className: 'bg-gray-100 text-gray-800' },
  SUBMITTED: { label: 'Đã gửi', className: 'bg-blue-100 text-blue-800' },
  ACTIVE: { label: 'Đang hiệu lực', className: 'bg-green-100 text-green-800' },
  IN_PROGRESS: { label: 'Đang thực hiện', className: 'bg-yellow-100 text-yellow-800' },
  COMPLETED: { label: 'Hoàn thành', className: 'bg-emerald-100 text-emerald-800' },
  ARCHIVED: { label: 'Lưu trữ', className: 'bg-gray-100 text-gray-600' },
}

export const TASK_STATUSES: Record<string, string> = {
  NOT_STARTED: 'Chưa bắt đầu',
  ASSIGNED: 'Đã giao',
  IN_PROGRESS: 'Đang thực hiện',
  WAITING: 'Đang chờ',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  OVERDUE: 'Quá hạn',
}

export const REPORT_STATUSES: Record<string, string> = {
  DRAFT: 'Nháp',
  SUBMITTED: 'Đã gửi',
  UNDER_REVIEW: 'Đang xem xét',
  REVISION_REQUESTED: 'Yêu cầu chỉnh sửa',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  FINALIZED: 'Hoàn tất',
}
