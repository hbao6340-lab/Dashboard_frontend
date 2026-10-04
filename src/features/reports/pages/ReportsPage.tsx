// Reports Page — short & brief form, attach pdf/word files, preview attachments
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Loader2, Send, Paperclip, Download, Eye, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth/AuthContext'
import { reportApi } from '@/services/reportApi'
import { FilePreviewDialog } from '@/components/FilePreviewDialog'
import { REPORT_STATUSES } from '@/lib/constants'
import { toast } from 'sonner'

const TYPE_LABELS: Record<string, string> = { TASK_SPECIFIC: 'Theo nhiệm vụ', MONTHLY: 'Tháng', GENERAL: 'Chung / Kiến nghị' }

export function ReportsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isReviewer = user && ['ADMINISTRATOR', 'DEVELOPER'].includes(user.role)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [detail, setDetail] = useState<any | null>(null)
  const [attachFile, setAttachFile] = useState<File | null>(null)
  // Short & brief form: title + type + content + files
  const [form, setForm] = useState({ title: '', type: 'GENERAL', content: '' })
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [review, setReview] = useState({ status: 'APPROVED', comments: '' })
  // Attachment preview popup
  const [previewAtt, setPreviewAtt] = useState<any | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['reports', search],
    queryFn: () => reportApi.getReports({ search, limit: 20 }),
  })

  const { data: detailData } = useQuery({
    queryKey: ['report-detail', detail?.id],
    queryFn: () => reportApi.getReport(detail.id),
    enabled: !!detail?.id,
  })

  const { data: attachData, refetch: refetchAttach } = useQuery({
    queryKey: ['report-attachments', detail?.id],
    queryFn: () => reportApi.getAttachments(detail.id),
    enabled: !!detail?.id,
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const created: any = await reportApi.createReport({ title: form.title, type: form.type, content: form.content || undefined })
      const reportId = created.data.report.id
      for (const f of newFiles) {
        await reportApi.uploadAttachment(reportId, f)
      }
      return created
    },
    onSuccess: () => {
      toast.success(newFiles.length > 0 ? `Đã tạo báo cáo kèm ${newFiles.length} tệp` : 'Đã tạo báo cáo')
      setShowCreate(false)
      setForm({ title: '', type: 'GENERAL', content: '' })
      setNewFiles([])
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
    onError: (e: any) => toast.error(e.message || 'Tạo báo cáo thất bại'),
  })

  const submitMutation = useMutation({
    mutationFn: (id: string) => reportApi.submitReport(id),
    onSuccess: () => { toast.success('Đã gửi báo cáo lên cấp trên'); queryClient.invalidateQueries({ queryKey: ['reports'] }) },
    onError: (e: any) => toast.error(e.message || 'Gửi thất bại'),
  })

  const reviewMutation = useMutation({
    mutationFn: () => reportApi.reviewReport(detail.id, review),
    onSuccess: () => { toast.success('Đã duyệt/xử lý báo cáo'); setDetail(null); queryClient.invalidateQueries({ queryKey: ['reports'] }) },
    onError: (e: any) => toast.error(e.message || 'Duyệt thất bại'),
  })

  const reports = (data as any)?.data?.reports ?? []
  const fullDetail = (detailData as any)?.data?.report ?? detail
  const attachments = (attachData as any)?.data?.attachments ?? []

  const handleAttach = async () => {
    if (!attachFile || !detail) return
    try {
      await reportApi.uploadAttachment(detail.id, attachFile)
      toast.success('Đã đính kèm tệp (doc, docx, pdf...)')
      setAttachFile(null)
      refetchAttach()
    } catch (e: any) {
      toast.error(e.message || 'Tải tệp thất bại')
    }
  }

  const openAttachmentPreview = async (a: any) => {
    if (!detail) return
    setPreviewAtt(a)
    setPreviewUrl(null)
    setPreviewLoading(true)
    try {
      const blob = await reportApi.previewAttachment(detail.id, a.id)
      setPreviewUrl(URL.createObjectURL(blob))
    } catch (e: any) {
      toast.error(e.message || 'Không xem trước được tệp')
    } finally {
      setPreviewLoading(false)
    }
  }

  const closeAttachmentPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPreviewAtt(null)
  }

  const downloadAttachment = async (a: any) => {
    if (!detail) return
    try {
      await reportApi.downloadAttachment(detail.id, a.id, a.fileName)
    } catch (e: any) {
      toast.error(e.message || 'Tải xuống thất bại')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Báo cáo & Kiến nghị</h1>
          <p className="text-muted-foreground">Gửi báo cáo, phản ánh vấn đề lên cấp trên kèm tệp đính kèm</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" /> Tạo báo cáo</Button>
      </div>

      <Card>
        <CardContent className="pt-6 flex gap-2 max-w-md">
          <Input placeholder="Tìm kiếm báo cáo..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant="outline" onClick={() => refetch()}>Tìm</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Danh sách báo cáo</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Chưa có báo cáo nào</div>
          ) : (
            <div className="space-y-2">
              {reports.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="cursor-pointer" onClick={() => setDetail(r)}>
                    <p className="font-medium hover:underline">{r.title}</p>
                    <p className="text-sm text-muted-foreground">{r.reportNumber} • {TYPE_LABELS[r.type] ?? r.type} • {r.author?.fullName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{REPORT_STATUSES[r.status] ?? r.status}</Badge>
                    {r.status === 'DRAFT' && <Button size="sm" variant="outline" onClick={() => submitMutation.mutate(r.id)}><Send className="mr-1 h-3 w-3" /> Gửi</Button>}
                    <Button size="sm" variant="ghost" onClick={() => setDetail(r)}>Chi tiết</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create — short & brief */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Tạo báo cáo / kiến nghị</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Tiêu đề *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Báo cáo tháng 10..." /></div>
            <div>
              <Label>Loại</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Nội dung</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Tóm tắt nội dung, vấn đề, kiến nghị..." rows={4} /></div>
            <div>
              <Label>Đính kèm tệp (pdf, word...)</Label>
              <Input
                type="file"
                multiple
                accept=".doc,.docx,.pdf,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.zip"
                onChange={(e) => setNewFiles(Array.from(e.target.files ?? []))}
              />
              {newFiles.length > 0 && (
                <div className="mt-1 space-y-1">
                  {newFiles.map((f, i) => (
                    <p key={i} className="text-sm text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3 w-3" /> {f.name} ({(f.size / 1024).toFixed(0)} KB)
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.title}>Tạo báo cáo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{fullDetail?.title}</DialogTitle></DialogHeader>
          {fullDetail && (
            <div className="space-y-3 text-sm">
              <p><b>Số hiệu:</b> {fullDetail.reportNumber} • <b>Trạng thái:</b> {REPORT_STATUSES[fullDetail.status] ?? fullDetail.status}</p>
              {fullDetail.content && <p><b>Nội dung:</b> {fullDetail.content}</p>}
              {fullDetail.subject && <p><b>Chủ đề:</b> {fullDetail.subject}</p>}
              {fullDetail.summary && <p><b>Tóm tắt:</b> {fullDetail.summary}</p>}
              {fullDetail.problems && <p><b>Vấn đề:</b> {fullDetail.problems}</p>}
              {fullDetail.recommendations && <p><b>Kiến nghị:</b> {fullDetail.recommendations}</p>}
              <div>
                <p className="font-medium mb-1"><Paperclip className="inline h-4 w-4 mr-1" />Tệp đính kèm (doc, docx, pdf...)</p>
                {attachments.length === 0 && <p className="text-muted-foreground">Chưa có tệp nào.</p>}
                {attachments.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-2 rounded bg-muted/50 mb-1">
                    <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{a.fileName}</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openAttachmentPreview(a)}><Eye className="h-3 w-3 mr-1" /> Xem</Button>
                      <Button size="sm" variant="outline" onClick={() => downloadAttachment(a)}><Download className="h-3 w-3 mr-1" /> Tải</Button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <Input type="file" accept=".doc,.docx,.pdf,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.zip" onChange={(e) => setAttachFile(e.target.files?.[0] ?? null)} />
                  <Button size="sm" onClick={handleAttach} disabled={!attachFile}>Đính kèm</Button>
                </div>
              </div>
              {isReviewer && ['SUBMITTED', 'UNDER_REVIEW'].includes(fullDetail.status) && (
                <div className="space-y-2 border-t pt-3">
                  <Label>Duyệt báo cáo (quản trị)</Label>
                  <Select value={review.status} onValueChange={(v) => setReview({ ...review, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APPROVED">Duyệt</SelectItem>
                      <SelectItem value="REVISION_REQUESTED">Yêu cầu chỉnh sửa</SelectItem>
                      <SelectItem value="REJECTED">Từ chối</SelectItem>
                      <SelectItem value="UNDER_REVIEW">Đang xem xét</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="Nhận xét..." value={review.comments} onChange={(e) => setReview({ ...review, comments: e.target.value })} rows={2} />
                  <Button onClick={() => reviewMutation.mutate()} disabled={reviewMutation.isPending}>Xác nhận</Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {fullDetail?.status === 'DRAFT' && <Button onClick={() => { submitMutation.mutate(fullDetail.id); setDetail(null) }}><Send className="mr-1 h-4 w-4" /> Gửi lên cấp trên</Button>}
            <Button variant="outline" onClick={() => setDetail(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attachment preview popup */}
      {previewAtt && (
        <FilePreviewDialog
          open={!!previewAtt}
          onClose={closeAttachmentPreview}
          title={previewAtt.fileName}
          subtitle={`Đính kèm của báo cáo ${fullDetail?.reportNumber ?? ''}`}
          fileName={previewAtt.fileName}
          mimeType={previewAtt.mimeType}
          blobUrl={previewUrl}
          loading={previewLoading}
          onDownload={() => downloadAttachment(previewAtt)}
        />
      )}
    </div>
  )
}
