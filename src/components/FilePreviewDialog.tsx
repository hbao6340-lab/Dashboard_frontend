// Shared file preview popup — images render inline; PDFs open via the
// browser's native viewer, a new tab, or Google Docs Viewer on mobile
// (mobile browsers cannot render PDF blob URLs in an iframe).
import { useMemo, useState } from 'react'
import { Download, FileText, ExternalLink, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

function isImage(name: string, mime?: string) {
  if (mime?.startsWith('image/')) return true
  return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(name)
}

function isPdf(name: string, mime?: string) {
  if (mime === 'application/pdf') return true
  return /\.pdf$/i.test(name)
}

interface FilePreviewDialogProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  fileName: string
  mimeType?: string
  blobUrl: string | null
  loading: boolean
  onDownload: () => void
}

// iframe cannot render blob PDFs on iOS Safari / Android Chrome
function useMobileBrowser() {
  return useMemo(() => {
    if (typeof window === 'undefined') return false
    return /Android|iPhone|iPad|iPod|Mobile|Line/i.test(window.navigator.userAgent)
  }, [])
}

export function FilePreviewDialog({ open, onClose, title, subtitle, fileName, mimeType, blobUrl, loading, onDownload }: FilePreviewDialogProps) {
  const [iframeBroken, setIframeBroken] = useState(false)
  const mobile = useMobileBrowser()
  const image = isImage(fileName, mimeType)
  const pdf = isPdf(fileName, mimeType)
  const previewable = image || pdf

  const googleViewerUrl = blobUrl
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(blobUrl)}&embedded=true`
    : null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : blobUrl ? (
          previewable ? (
            image ? (
              <img src={blobUrl} alt={title} className="max-h-[60vh] mx-auto rounded border" />
            ) : pdf && !mobile ? (
              <>
                {iframeBroken ? (
                  <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground text-center">
                    <AlertTriangle className="h-10 w-10 text-amber-500" />
                    <p>Trình xem PDF trong trang không khả dụng trên thiết bị này.</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button onClick={() => { window.open(googleViewerUrl!, '_blank'); }} variant="outline">
                        <ExternalLink className="mr-2 h-4 w-4" /> Mở bằng Google Docs
                      </Button>
                      <Button onClick={onDownload}>
                        <Download className="mr-2 h-4 w-4" /> Tải xuống
                      </Button>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={blobUrl}
                    title={title}
                    className="w-full h-[60vh] rounded border"
                    onError={() => setIframeBroken(true)}
                  />
                )}
              </>
            ) : pdf && mobile ? (
              <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground text-center">
                <FileText className="h-16 w-16" />
                <p>Trên điện thoại, hãy mở tệp PDF bằng Google Docs hoặc tải xuống để xem bằng ứng dụng đọc PDF.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button onClick={() => { window.open(googleViewerUrl!, '_blank'); }}>
                    <ExternalLink className="mr-2 h-4 w-4" /> Mở bằng Google Docs
                  </Button>
                  <Button onClick={onDownload} variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Tải xuống
                  </Button>
                </div>
              </div>
            ) : (
              <img src={blobUrl} alt={title} className="max-h-[60vh] mx-auto rounded border" />
            )
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <FileText className="h-16 w-16" />
              <p>Không hỗ trợ xem trước định dạng này trong ứng dụng.</p>
              <Button onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" /> Tải xuống để xem
              </Button>
            </div>
          )
        ) : (
          !loading && <p className="text-center text-muted-foreground py-12">Không tải được nội dung tệp.</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" /> Tải xuống
          </Button>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
