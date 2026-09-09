// Toaster Component
import { Toaster as ToasterPrimitive } from 'sonner'

export function Toaster() {
  return <ToasterPrimitive theme="system" className="toaster group" toastOptions={{ classNames: { toast: 'group' } }} />
}