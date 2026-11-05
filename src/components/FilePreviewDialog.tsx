// Shared file preview popup — images render inline; PDFs render with PDF.js
// in-page (no Google Docs Viewer, no iframe/blob handling).
import { useEffect, useState } from 'react'
import { Download, FileText, Loader2, ExternalLink } from 'lucide-react'
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

// Renders every page of a PDF to canvas elements — works on any browser
// (Windows, iOS Safari, macOS, Android Chrome, Samsung Internet...).
// If in-page rendering fails (unsupported device/browser), falls back to
// opening the file in a new tab with the browser's native PDF viewer.
function PdfViewer({ blobUrl, title }: { blobUrl: string; title: string }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false
    let loadingTask: { promise: Promise<any>; destroy: () => Promise<any> } | null = null
    const host = document.getElementById('pdf-canvas-host')
    if (host) host.replaceChildren()
    setStatus('loading')

    void (async () => {
      try {
        const pdfjs = await import('pdfjs-dist')
        const data = await fetch(blobUrl).then((r) => r.arrayBuffer())
        const task = (pdfjs as any).getDocument({ data })
        loadingTask = task
        const pdf = await task.promise
        if (cancelled) return
        const target = document.getElementById('pdf-canvas-host')
        if (!target) return
        target.replaceChildren()

        // Basic check: websites always render at least the first page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) return
          const page = await pdf.getPage(pageNum)
          const viewport = page.getViewport({ scale: 1.8 })
          const canvas = document.createElement('canvas')
          canvas.width = Math.floor(viewport.width)
          canvas.height = Math.floor(viewport.height)
          canvas.className = 'w-full h-auto rounded border bg-white shadow'
          canvas.setAttribute('aria-label', `Trang ${pageNum} của ${title}`)
          const ctx = canvas.getContext('2d')
          if (!ctx) continue
          await page.render({ canvasContext: ctx, viewport }).promise
          target.appendChild(canvas)
        }
        if (!cancelled) setStatus('ready')
      } catch (e) {
        if (!cancelled) setStatus('error')
      }
    })()

    return () => {
      cancelled = true
      void loadingTask?.destroy()
    }
  }, [blobUrl, title])

  return (
    <div className="w-full">
      {status === 'loading' && (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Đang tải PDF...
        </div>
      )}
      {status === 'error' && (
        <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
          <FileText className="h-12 w-12" />
          <p>Trình duyệt không mở được tệp PDF này trong trang.</p>
          <p className="mt-1 text-sm">Hãy mở trong tab mới bằng trình xem PDF của trình duyệt.</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Button
              onClick={() => { window.open(blobUrl, '_blank', 'noopener,noreferrer'); }}
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Mở trong tab mới
            </Button>
          </div>
        </div>
      )}
      <div id="pdf-canvas-host" className="flex-col items-center gap-3 max-h-[64vh] overflow-y-auto p-1" style={{ display: status === 'loading' || status === 'error' ? 'none' : 'flex' }} />
    </div>
  )
}

export function FilePreviewDialog({ open, onClose, title, subtitle, fileName, mimeType, blobUrl, loading, onDownload }: FilePreviewDialogProps) {
  const image = isImage(fileName, mimeType)
  const pdf = isPdf(fileName, mimeType)
  const previewable = image || pdf

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : blobUrl ? (
          previewable ? (
            image ? (
              <img src={blobUrl} alt={title} className="max-h-[64vh] mx-auto rounded border" />
            ) : (
              <PdfViewer blobUrl={blobUrl} title={title} />
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
          !loading && (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <p>Không tải được nội dung tệp.</p>
              <Button variant="outline" onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" /> Tải xuống
              </Button>
            </div>
          )
        )}
        <DialogFooter>
          {blobUrl && (
            <Button
              variant="outline"
              onClick={() => { window.open(blobUrl, '_blank', 'noopener,noreferrer'); }}
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Mở tab mới
            </Button>
          )}
          <Button variant="outline" onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" /> Tải xuống
          </Button>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
