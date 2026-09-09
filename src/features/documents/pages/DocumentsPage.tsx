// Documents Page with full UI
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Filter, Download, Eye, Edit, Archive, FileText, MoreVertical, ChevronDown, Upload, Clock, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useDocuments, useUploadDocument, useDeleteDocument, useAssignDocument, useCategories, useCreateVersion } from '@/features/documents/hooks/useDocuments'
import { documentApi } from '@/services/documentApi'
import { formatDate, formatRelativeTime, getInitials, cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX', 'TXT', 'JPG', 'JPEG', 'PNG', 'ZIP', 'OTHER']),
  categoryId: z.string().optional(),
  confidentiality: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']).default('INTERNAL'),
  relatedTaskId: z.string().optional(),
  relatedReportId: z.string().optional(),
})

const assignSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  responsibility: z.string().optional(),
  instructions: z.string().optional(),
  deadline: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).default('NORMAL'),
  notes: z.string().optional(),
})

const versionSchema = z.object({
  changeNotes: z.string().optional(),
})

type UploadFormData = z.infer<typeof uploadSchema>
type AssignFormData = z.infer<typeof assignSchema>
type VersionFormData = z.infer<typeof versionSchema>

const mockUsers = [
  { id: '1', username: 'user001', fullName: 'John Doe', email: 'john@example.com' },
  { id: '2', username: 'user002', fullName: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', username: 'admin', fullName: 'Admin User', email: 'admin@example.com' },
]

const mockTasks = [
  { id: '1', taskNumber: 'TASK-2024-000001', title: 'Community Outreach Planning' },
  { id: '2', taskNumber: 'TASK-2024-000002', title: 'Safety Protocol Review' },
]

const mockReports = [
  { id: '1', reportNumber: 'RPT-2024-000001', title: 'Monthly Activity Report' },
  { id: '2', reportNumber: 'RPT-2024-000002', title: 'Q1 Performance Summary' },
]

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
    SUBMITTED: { label: 'Submitted', className: 'bg-blue-100 text-blue-800' },
    ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-800' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-800' },
    COMPLETED: { label: 'Completed', className: 'bg-emerald-100 text-emerald-800' },
    ARCHIVED: { label: 'Archived', className: 'bg-gray-100 text-gray-600' },
  }
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
  return <Badge className={config.className}>{config.label}</Badge>
}

function PriorityBadge({ priority }: { priority: string }) {
  const priorityConfig: Record<string, { label: string; className: string }> = {
    LOW: { label: 'Low', className: 'bg-gray-100 text-gray-800' },
    NORMAL: { label: 'Normal', className: 'bg-blue-100 text-blue-800' },
    HIGH: { label: 'High', className: 'bg-orange-100 text-orange-800' },
    CRITICAL: { label: 'Critical', className: 'bg-red-100 text-red-800' },
  }
  const config = priorityConfig[priority] || { label: priority, className: 'bg-gray-100 text-gray-800' }
  return <Badge className={config.className}>{config.label}</Badge>
}

function DocumentTypeIcon({ type }: { type: string }) {
  return <FileText className="h-5 w-5 text-gray-500" />
}

interface DocumentRow {
  id: string
  documentNumber: string
  title: string
  type: string
  categoryId?: string
  status: string
  version: number
  fileSize: number
  mimeType: string
  filePath: string
  originalName: string
  confidentiality: string
  uploadedById: string
  relatedTaskId?: string
  relatedReportId?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  category?: { id: string; name: string; color: string }
  uploadedBy: { id: string; username: string; fullName: string }
  assignments?: Array<{
    id: string
    user: { id: string; username: string; fullName: string; email: string }
  }>
}

interface CategoriesData {
  data: {
    categories: Array<{ id: string; name: string; color: string }>
  }
}

export function DocumentsPage() {
  const [searchParams, setSearchParams] = useState({ page: 1, limit: 20, search: '', status: '', type: '', categoryId: '' })
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState<{ open: boolean; documentId: string }>({ open: false, documentId: '' })
  const [showVersionDialog, setShowVersionDialog] = useState<{ open: boolean; documentId: string }>({ open: false, documentId: '' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [versionFile, setVersionFile] = useState<File | null>(null)

  const { data: documentsData, isLoading, refetch } = useDocuments(searchParams)
  const { data: categoriesData } = useCategories()
  const uploadMutation = useUploadDocument()
  const deleteMutation = useDeleteDocument()
  const assignMutation = useAssignDocument()
  const versionMutation = useCreateVersion()

  const uploadForm = useForm<UploadFormData>({ resolver: zodResolver(uploadSchema), defaultValues: { confidentiality: 'INTERNAL', type: 'PDF' } })
  const assignForm = useForm<AssignFormData>({ resolver: zodResolver(assignSchema) })
  const versionForm = useForm<VersionFormData>({ resolver: zodResolver(versionSchema) })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  const handleVersionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setVersionFile(file)
  }

  const onUploadSubmit = async (data: UploadFormData) => {
    if (!selectedFile) { toast.error('Please select a file'); return }
    const formData = new FormData()
    formData.append('file', selectedFile)
    Object.entries(data).forEach(([key, value]) => { if (value) formData.append(key, value) })
    await uploadMutation.mutateAsync(formData)
    setShowUploadDialog(false)
    setSelectedFile(null)
    uploadForm.reset({ confidentiality: 'INTERNAL', type: 'PDF' })
    refetch()
  }

  const onAssignSubmit = async (data: AssignFormData) => {
    await assignMutation.mutateAsync({ id: showAssignDialog.documentId, data })
    setShowAssignDialog({ open: false, documentId: '' })
    assignForm.reset()
    refetch()
  }

  const onVersionSubmit = async (data: VersionFormData) => {
    if (!versionFile) { toast.error('Please select a file'); return }
    const formData = new FormData()
    formData.append('file', versionFile)
    if (data.changeNotes) formData.append('changeNotes', data.changeNotes)
    await versionMutation.mutateAsync({ id: showVersionDialog.documentId, formData })
    setShowVersionDialog({ open: false, documentId: '' })
    setVersionFile(null)
    versionForm.reset()
    refetch()
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to archive this document?')) {
      await deleteMutation.mutateAsync(id)
      refetch()
    }
  }

  const handleAssignClick = (id: string) => {
    setShowAssignDialog({ open: true, documentId: id })
  }

  const handleVersionClick = (id: string) => {
    setShowVersionDialog({ open: true, documentId: id })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams(prev => ({ ...prev, page: 1 }))
  }

  const handleStatusChange = (value: string) => setSearchParams(prev => ({ ...prev, status: value, page: 1 }))
  const handleTypeChange = (value: string) => setSearchParams(prev => ({ ...prev, type: value, page: 1 }))
  const handleCategoryChange = (value: string) => setSearchParams(prev => ({ ...prev, categoryId: value, page: 1 }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Manage and organize documents</p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search" className="sr-only">Search</Label>
              <Input
                id="search"
                placeholder="Search documents..."
                value={searchParams.search}
                onChange={(e) => setSearchParams(prev => ({ ...prev, search: e.target.value }))}
                className="max-w-sm"
              />
            </div>
            <Select value={searchParams.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={searchParams.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="DOC">DOC</SelectItem>
                <SelectItem value="DOCX">DOCX</SelectItem>
                <SelectItem value="XLS">XLS</SelectItem>
                <SelectItem value="XLSX">XLSX</SelectItem>
                <SelectItem value="PPT">PPT</SelectItem>
                <SelectItem value="PPTX">PPTX</SelectItem>
                <SelectItem value="TXT">TXT</SelectItem>
                <SelectItem value="JPG">JPG</SelectItem>
                <SelectItem value="PNG">PNG</SelectItem>
                <SelectItem value="ZIP">ZIP</SelectItem>
              </SelectContent>
            </Select>
            <Select value={searchParams.categoryId} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categoriesData?.data.categories.map((c: { id: string; name: string; color: string }) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button type="submit"><Search className="mr-2 h-4 w-4" /> Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : documentsData?.data.documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No documents found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"><input type="checkbox" className="h-4 w-4 rounded border-gray-300" /></TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignees</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentsData?.data.documents.map((doc: DocumentRow) => (
                    <TableRow key={doc.id}>
                      <TableCell><input type="checkbox" className="h-4 w-4 rounded border-gray-300" /></TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex items-center gap-3">
                          <DocumentTypeIcon type={doc.type} />
                          <div>
                            <p className="font-medium truncate">{doc.title}</p>
                            <p className="text-sm text-muted-foreground">{doc.documentNumber}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{doc.type}</Badge></TableCell>
                      <TableCell>
                        {doc.category ? (
                          <Badge style={{ backgroundColor: doc.category.color + '20', color: doc.category.color }}>
                            {doc.category.name}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">
                            {getInitials(doc.uploadedBy.fullName)}
                          </div>
                          <span className="text-sm">{doc.uploadedBy.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(doc.createdAt)}</TableCell>
                      <TableCell><StatusBadge status={doc.status} /></TableCell>
                      <TableCell>
                        {doc.assignments && doc.assignments.length > 0 ? (
                          <div className="flex -space-x-2">
                            {doc.assignments.slice(0, 3).map((a) => (
                              <div key={a.id} className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary border-2 border-background" title={a.user.fullName}>
                                {getInitials(a.user.fullName)}
                              </div>
                            ))}
                            {doc.assignments.length > 3 && (
                              <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600 border-2 border-background">
                                +{doc.assignments.length - 3}
                              </div>
                            )}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAssignClick(doc.id)}>
                              <Clock className="mr-2 h-4 w-4" />
                              Assign
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleVersionClick(doc.id)}>
                              <Upload className="mr-2 h-4 w-4" />
                              New Version
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(doc.id)}>
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {documentsData && documentsData.data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {documentsData.data.pagination.page} of {documentsData.data.pagination.totalPages} ({documentsData.data.pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={documentsData.data.pagination.page === 1} onClick={() => setSearchParams(p => ({ ...p, page: p.page - 1 }))}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={documentsData.data.pagination.page === documentsData.data.pagination.totalPages} onClick={() => setSearchParams(p => ({ ...p, page: p.page + 1 }))}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Fill in the details and select a file to upload</DialogDescription>
          </DialogHeader>
          <form onSubmit={uploadForm.handleSubmit(onUploadSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input {...uploadForm.register('title')} id="title" placeholder="Document title" />
                {uploadForm.formState.errors.title && <p className="text-sm text-destructive">{uploadForm.formState.errors.title.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea {...uploadForm.register('description')} id="description" placeholder="Optional description" rows={3} />
              </div>
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select {...uploadForm.register('type')}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX', 'TXT', 'JPG', 'JPEG', 'PNG', 'ZIP', 'OTHER'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="confidentiality">Confidentiality</Label>
                <Select {...uploadForm.register('confidentiality')}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="INTERNAL">Internal</SelectItem>
                    <SelectItem value="CONFIDENTIAL">Confidential</SelectItem>
                    <SelectItem value="RESTRICTED">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="categoryId">Category</Label>
                <Select {...uploadForm.register('categoryId')}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
{categoriesData?.data.categories.map((c: { id: string; name: string; color: string }) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="file">File *</Label>
              <Input id="file" type="file" onChange={handleFileChange} disabled={uploadMutation.isPending} />
              {selectedFile && <p className="text-sm text-muted-foreground mt-1">Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Upload'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog.open} onOpenChange={(open) => setShowAssignDialog({ ...showAssignDialog, open })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Document</DialogTitle>
            <DialogDescription>Assign this document to a user with responsibilities and deadline</DialogDescription>
          </DialogHeader>
          <form onSubmit={assignForm.handleSubmit(onAssignSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="assign-user">User *</Label>
              <Select {...assignForm.register('userId')}>
                <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                <SelectContent>
                  {mockUsers.map((u) => <SelectItem key={u.id} value={u.id}>{u.fullName} ({u.username})</SelectItem>)}
                </SelectContent>
              </Select>
              {assignForm.formState.errors.userId && <p className="text-sm text-destructive">{assignForm.formState.errors.userId.message}</p>}
            </div>
            <div>
              <Label htmlFor="responsibility">Responsibility</Label>
              <Textarea {...assignForm.register('responsibility')} id="responsibility" placeholder="What is the user responsible for?" rows={2} />
            </div>
            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea {...assignForm.register('instructions')} id="instructions" placeholder="Specific instructions for this assignment" rows={2} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" type="date" {...assignForm.register('deadline')} />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select {...assignForm.register('priority')}>
                  <SelectTrigger><SelectValue placeholder="Normal" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea {...assignForm.register('notes')} id="notes" placeholder="Additional notes" rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAssignDialog({ open: false, documentId: '' })}>Cancel</Button>
              <Button type="submit" disabled={assignMutation.isPending}>
                {assignMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Assign'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Version Dialog */}
      <Dialog open={showVersionDialog.open} onOpenChange={(open) => setShowVersionDialog({ ...showVersionDialog, open })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
            <DialogDescription>Upload a new version of the document</DialogDescription>
          </DialogHeader>
          <form onSubmit={versionForm.handleSubmit(onVersionSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="changeNotes">Change Notes</Label>
              <Textarea {...versionForm.register('changeNotes')} id="changeNotes" placeholder="What changed in this version?" rows={3} />
            </div>
            <div>
              <Label htmlFor="version-file">File *</Label>
              <Input id="version-file" type="file" onChange={handleVersionFileChange} disabled={versionMutation.isPending} />
              {versionFile && <p className="text-sm text-muted-foreground mt-1">Selected: {versionFile.name}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowVersionDialog({ open: false, documentId: '' })}>Cancel</Button>
              <Button type="submit" disabled={versionMutation.isPending}>
                {versionMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Version'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}