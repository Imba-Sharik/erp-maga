import { useQueryClient } from '@tanstack/react-query'
import { LogOut, User } from 'lucide-react'
import { useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MagLogo, SettingsIcon } from '@/shared/assets'
import { useCurrentUser } from '@/entities/current-user'
import { useUnreadNotificationCount } from '@/entities/notification'
import { clearSessionTokens } from '@/entities/session'
import {
  USER_ROLE_LABELS,
  useRoleNavItems,
  useUserRole,
} from '@/entities/user-role'
import { DEV_ROLES_WITH_CREDS, useDevLogin, type DevRole } from '@/features/auth'
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/shared/ui/sidebar'

const IS_DEV = import.meta.env.DEV

export function AppSidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { state, isMobile, setOpenMobile } = useSidebar()
  const handleNavClick = useCallback(() => {
    if (isMobile) setOpenMobile(false)
  }, [isMobile, setOpenMobile])
  const showCollapseInSidebar = !isMobile && state === 'expanded'
  const queryClient = useQueryClient()
  const role = useUserRole()
  const user = useCurrentUser()
  const roleName = `${USER_ROLE_LABELS[role]} MAG`
  const navItems = useRoleNavItems()
  const unreadCount = useUnreadNotificationCount()
  const { loginAs, isPending: isDevLoginPending } = useDevLogin()

  const handleLogout = () => {
    if (isMobile) setOpenMobile(false)
    clearSessionTokens()
    queryClient.clear()
    // Defer navigation: даём Radix-овским Sheet/DropdownMenu отработать unmount
    // и снять body-стили (pointer-events:none), иначе после редиректа на /login
    // инпуты на мобиле остаются некликабельными.
    setTimeout(() => navigate('/login', { replace: true }), 0)
  }

  return (
    <Sidebar collapsible="icon" className="overflow-hidden pt-1">
      <SidebarHeader>
        <div className="text-sidebar-accent-foreground flex w-full items-center gap-2">
          <MagLogo
            aria-label="ERP MAG"
            className="size-10 shrink-0 rounded-lg transition-[width,height] duration-200 ease-linear group-data-[collapsible=icon]:size-8"
          />
          <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-base font-bold">ERP MAG</span>
            <span className="text-muted-foreground truncate text-xs">Operations console</span>
          </div>
          {showCollapseInSidebar && (
            <span className="animate-sidebar-trigger-from-right ml-auto inline-flex shrink-0 self-start">
              <SidebarTrigger />
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden">
        <SidebarGroup className="pt-4">
          <SidebarGroupLabel className="text-muted-foreground">ОСНОВНОЕ</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
                const showDot = item.id === 'notifications' && unreadCount > 0
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                      className="hover:text-sidebar-accent-foreground border border-transparent data-[active=true]:border-[#B1B1B1] data-[active=true]:bg-[#FFFFFF] data-[active=true]:font-normal"
                    >
                      <Link to={item.url} onClick={handleNavClick}>
                        <div
                          className={cn(
                            'flex min-w-0 flex-1 items-center gap-2 transition-transform duration-200 ease-out',
                            isActive && (isMobile || state === 'expanded') && 'translate-x-[2px]',
                          )}
                        >
                          <span className="relative flex shrink-0">
                            <item.icon className="size-4 shrink-0" />
                            {showDot && (
                              <span className="ring-sidebar absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#D25252] ring-2" />
                            )}
                          </span>
                          <span className="truncate">{item.title}</span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="mx-3 group-data-[collapsible=icon]:hidden">
          <p className="text-muted-foreground pb-1 text-start text-xs whitespace-nowrap">V 0.5.5</p>
          <div
            aria-hidden
            className="border-sidebar-border shrink-0 border-t group-data-[collapsible=icon]:mx-0"
          />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-10 shrink-0 rounded-full transition-[width,height] duration-200 ease-linear group-data-[collapsible=icon]:size-8">
                    <AvatarFallback className="rounded-full">{user.initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 gap-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.displayName}</span>
                    <span className="text-muted-foreground truncate text-xs">{roleName}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                {IS_DEV && DEV_ROLES_WITH_CREDS.length > 0 && (
                  <>
                    <DropdownMenuLabel className="text-muted-foreground text-2xs tracking-wide uppercase">
                      Войти как (dev)
                    </DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={role}
                      onValueChange={(v) => loginAs(v as DevRole)}
                    >
                      {DEV_ROLES_WITH_CREDS.map((r) => (
                        <DropdownMenuRadioItem key={r} value={r} disabled={isDevLoginPending}>
                          {USER_ROLE_LABELS[r]}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/profile" onClick={handleNavClick}>
                    <User />
                    Профиль
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" onClick={handleNavClick}>
                    <SettingsIcon />
                    Настройки
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
