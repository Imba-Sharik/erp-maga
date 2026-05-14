import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { BreadcrumbProvider } from '@/shared/hooks/use-breadcrumb'
import { formatRuHeaderDate } from '@/shared/lib/date/format-ru-header-date'
import { toIsoLocalDay } from '@/shared/lib/date/to-iso-local-day'
import { cn } from '@/shared/lib/utils'
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from '@/shared/ui/sidebar'
import { AppBreadcrumb } from '@/widgets/app-breadcrumb'
import { AppSidebar } from '@/widgets/app-sidebar'
import { HeaderNotificationsButton } from '@/widgets/header-notifications'

function HeaderTodayDate({ className }: { className?: string }) {
  const [today, setToday] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setToday(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <time
      dateTime={toIsoLocalDay(today)}
      className={cn('text-muted-foreground text-xs', className)}
    >
      {formatRuHeaderDate(today)}
    </time>
  )
}

function AppLayoutHeader() {
  const { state, isMobile } = useSidebar()
  const showSidebarTrigger = isMobile || state === 'collapsed'

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
      {showSidebarTrigger && (
        <span className="animate-sidebar-trigger inline-flex">
          <SidebarTrigger />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <AppBreadcrumb />
      </div>
      <div className="flex shrink-0 items-center gap-2 pr-4">
        <HeaderTodayDate />
        <HeaderNotificationsButton />
      </div>
    </header>
  )
}

export function AppLayout() {
  return (
    <BreadcrumbProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="h-svh max-h-svh min-h-0 overflow-hidden">
          <AppLayoutHeader />
          <main className="@container/main flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </BreadcrumbProvider>
  )
}
