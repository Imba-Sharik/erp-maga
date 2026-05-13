import { Outlet } from 'react-router-dom'
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from '@/shared/ui/sidebar'
import { AppSidebar } from '@/widgets/app-sidebar'

function AppLayoutHeader() {
  const { state, isMobile } = useSidebar()
  const showSidebarTrigger = isMobile || state === 'collapsed'

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      {showSidebarTrigger && (
        <span className="animate-sidebar-trigger inline-flex">
          <SidebarTrigger />
        </span>
      )}
    </header>
  )
}

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppLayoutHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
