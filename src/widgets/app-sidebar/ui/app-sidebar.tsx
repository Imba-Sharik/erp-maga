import { LogOut, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import {
  MagLogo,
  BellIcon,
  CalendarIcon,
  DashboardIcon,
  FolderIcon,
  ListChecksIcon,
  SettingsIcon,
} from '@/shared/assets'
import { USER_ROLES, USER_ROLE_LABELS, useUserRole, useUserRoleStore, type UserRole } from '@/entities/user-role'
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

const navItems = [
  { title: 'Дашборд', url: '/dashboard', icon: DashboardIcon },
  { title: 'Календарь', url: '/calendar', icon: CalendarIcon },
  { title: 'Проекты', url: '/projects', icon: FolderIcon },
  { title: 'Закрытие', url: '/closing', icon: ListChecksIcon },
  { title: 'Уведомления', url: '/notifications', icon: BellIcon },
  { title: 'Настройки', url: '/settings', icon: SettingsIcon },
]

const user = {
  name: 'Игорь Шарин',
  email: 'sharinigor1@gmail.com',
  initials: 'ИШ',
}

export function AppSidebar() {
  const { pathname } = useLocation()
  const { state, isMobile } = useSidebar()
  const showCollapseInSidebar = !isMobile && state === 'expanded'
  const role = useUserRole()
  const setRole = useUserRoleStore((s) => s.setRole)
  const roleName = `${USER_ROLE_LABELS[role]} MAG`

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
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                      className="hover:text-sidebar-accent-foreground border border-transparent data-[active=true]:border-[#B1B1B1] data-[active=true]:bg-[#FFFFFF] data-[active=true]:font-normal"
                    >
                      <Link to={item.url}>
                        <div
                          className={cn(
                            'flex min-w-0 flex-1 items-center gap-2 transition-transform duration-200 ease-out',
                            isActive && (isMobile || state === 'expanded') && 'translate-x-[2px]',
                          )}
                        >
                          <item.icon className="size-4 shrink-0" />
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
          <p className="text-muted-foreground pb-1 text-start text-xs whitespace-nowrap">V 0.0.1</p>
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
                    <span className="truncate font-semibold">{user.name}</span>
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
                <DropdownMenuLabel className="text-muted-foreground text-[11px] tracking-wide uppercase">
                  Войти как (dev)
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={role}
                  onValueChange={(v) => setRole(v as UserRole)}
                >
                  {USER_ROLES.map((r) => (
                    <DropdownMenuRadioItem key={r} value={r}>
                      {USER_ROLE_LABELS[r]}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User />
                    Профиль
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <SettingsIcon />
                    Настройки
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
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
