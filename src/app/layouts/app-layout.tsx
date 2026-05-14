import { Outlet } from 'react-router-dom'
import { BreadcrumbProvider } from '@/shared/hooks/use-breadcrumb'
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from '@/shared/ui/sidebar'
import { AppBreadcrumb } from '@/widgets/app-breadcrumb'
import { AppSidebar } from '@/widgets/app-sidebar'

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
      <AppBreadcrumb />
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
          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </BreadcrumbProvider>
  )
}
