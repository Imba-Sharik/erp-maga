import { ExternalLink } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

interface PlumLinkProps {
  href: string
  className?: string
}

export function PlumLink({ href, className }: PlumLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'text-funnel-preproject hover:text-funnel-preproject/80 inline-flex items-center gap-1.5 text-sm font-medium transition-colors',
        className,
      )}
    >
      <span className="bg-funnel-preproject inline-flex size-4 items-center justify-center rounded">
        <ExternalLink className="size-2.5 text-white" strokeWidth={2.5} />
      </span>
      Карточка в PLUM
    </a>
  )
}
