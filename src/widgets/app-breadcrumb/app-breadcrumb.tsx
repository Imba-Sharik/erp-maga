import { Fragment } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useBreadcrumbValue } from '@/shared/hooks/use-breadcrumb'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'

export function AppBreadcrumb() {
  const { crumbs } = useBreadcrumbValue()
  if (crumbs.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-1.5 text-[13px] sm:gap-1.5">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          const isFirst = index === 0
          return (
            <Fragment key={`${crumb.label}-${index}`}>
              <BreadcrumbItem>
                {isLast || !crumb.to ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.to} className="inline-flex items-center gap-1">
                      {isFirst && <ChevronLeft className="size-3.5" />}
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
