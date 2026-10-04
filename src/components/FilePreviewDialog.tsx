// Shared file preview popup — images and PDFs render inline,
// other formats show a download fallback. Used by Documents and Reports.
import { Download, FileText, Loader2 } from 'lucide-react'
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

export function FilePreviewDialog({ open, onClose, title, subtitle, fileName, mimeType, blobUrl, loading, onDownload }: FilePreviewDialogProps) {
  const previewable = isImage(fileName, mimeType) || isPdf(fileName, mimeType)

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
            isImage(fileName, mimeType) ? (
              <img src={blobUrl} alt={title} className="max-h-[60vh] mx-auto rounded border" />
            ) : (
              <iframe src={blobUrl} title={title} className="w-full h-[60vh] rounded border" />
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
