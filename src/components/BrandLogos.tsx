// Brand logos Đoàn - Hội - Đội.
// Image files live in public/logos/ (see public/logos/README.md).
// Missing files degrade gracefully (broken images are hidden).
import { cn } from '@/lib/utils'

const LOGOS = [
  { src: '/logos/logo-doan.png', alt: 'Đoàn TNCS Hồ Chí Minh' },
  { src: '/logos/logo-hoi.png', alt: 'Hội Liên hiệp Thanh niên Việt Nam' },
  { src: '/logos/logo-doi.png', alt: 'Đội TNTP Hồ Chí Minh' },
]

const SIZES = {
  sm: 'h-10',
  md: 'h-16',
  lg: 'h-20 sm:h-24',
} as const

export function BrandLogos({ size = 'md', className }: { size?: keyof typeof SIZES; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-2 sm:gap-3', className)} role="img" aria-label="Đoàn - Hội - Đội">
      {LOGOS.map((logo) => (
        <img
          key={logo.src}
          src={logo.src}
          alt={logo.alt}
          title={logo.alt}
          loading="lazy"
          className={cn(SIZES[size], 'w-auto object-contain drop-shadow')}
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      ))}
    </div>
  )
}
