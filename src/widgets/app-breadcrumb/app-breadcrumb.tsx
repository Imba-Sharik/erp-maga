import { Fragment } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useBreadcrumbValue } from '@/shared/hooks/use-breadcrumb'
import { cn } from '@/shared/lib/utils'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'

function CrumbLabel({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn('block truncate', className)} title={label}>
      {label}
    </span>
  )
}

export function AppBreadcrumb() {
  const { crumbs } = useBreadcrumbValue()
  if (crumbs.length === 0) return null

  const collapseMiddle = crumbs.length > 2
  const compactBack = crumbs.length > 1

  return (
    <Breadcrumb className="min-w-0 w-full">
      <BreadcrumbList className="flex-nowrap gap-1 overflow-hidden text-sm md:flex-wrap md:overflow-visible md:gap-1.5">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          const isFirst = index === 0
          const isMiddle = collapseMiddle && !isFirst && !isLast

          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {index === 1 && collapseMiddle ? (
                <>
                  <BreadcrumbItem className="shrink-0 md:hidden">
                    <BreadcrumbEllipsis className="size-7" />
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="shrink-0 md:hidden">/</BreadcrumbSeparator>
                </>
              ) : null}
              <BreadcrumbItem
                className={cn(
                  isMiddle && 'hidden md:inline-flex',
                  isLast ? 'min-w-0 flex-1 overflow-hidden' : 'max-w-[45%] shrink-0 md:max-w-none',
                  compactBack && isFirst && 'max-w-none',
                )}
              >
                {isLast || !crumb.to ? (
                  <BreadcrumbPage className="block min-w-0 truncate" title={crumb.label}>
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      to={crumb.to}
                      className={cn(
                        'inline-flex max-w-full min-w-0 items-center gap-1',
                        compactBack && isFirst && 'shrink-0',
                      )}
                      title={crumb.label}
                      aria-label={compactBack && isFirst ? crumb.label : undefined}
                    >
                      {isFirst ? <ChevronLeft className="size-3.5 shrink-0" /> : null}
                      {compactBack && isFirst ? (
                        <>
                          <span className="sr-only">{crumb.label}</span>
                          <span className="hidden truncate md:inline">{crumb.label}</span>
                        </>
                      ) : (
                        <CrumbLabel label={crumb.label} />
                      )}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast ? (
                <BreadcrumbSeparator
                  className={cn('shrink-0', isFirst && compactBack && 'max-md:hidden')}
                >
                  /
                </BreadcrumbSeparator>
              ) : null}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
