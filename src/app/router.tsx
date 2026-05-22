import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RequireRole } from './guards/require-role'
import { RoleHomeRedirect } from './guards/role-home'
import { AppLayout } from './layouts/app-layout'
import { CalendarPage } from '@/pages/calendar'
import { ClosedRequestsPage } from '@/pages/closed-requests'
import { ClosingPage } from '@/pages/closing'
import { DashboardPage } from '@/pages/dashboard'
import { LoginPage } from '@/pages/login'
import { NotFoundPage } from '@/pages/not-found'
import { NotificationsPage } from '@/pages/notifications'
import { ManagersPage } from '@/pages/managers'
import { OutsideMagPage } from '@/pages/outside-mag'
import { ProfilePage } from '@/pages/profile'
import { ProjectDetailPage } from '@/pages/project-detail'
import { ProjectsPage } from '@/pages/projects'
import { RequestDetailPage } from '@/pages/request-detail'
import { RequestsPage } from '@/pages/requests'
import { SettingsPage } from '@/pages/settings'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <RoleHomeRedirect /> },
      { path: 'dashboard', element: <DashboardPage /> },
      {
        path: 'calendar',
        element: (
          <RequireRole roles={['manager', 'director']}>
            <CalendarPage />
          </RequireRole>
        ),
      },
      {
        path: 'projects',
        element: (
          <RequireRole roles={['manager', 'director']}>
            <ProjectsPage />
          </RequireRole>
        ),
      },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
      {
        path: 'closing',
        element: (
          <RequireRole roles={['manager', 'director']}>
            <ClosingPage />
          </RequireRole>
        ),
      },
      {
        path: 'requests',
        element: (
          <RequireRole roles={['accountant']}>
            <RequestsPage />
          </RequireRole>
        ),
      },
      {
        path: 'requests/:id',
        element: (
          <RequireRole roles={['accountant']}>
            <RequestDetailPage />
          </RequireRole>
        ),
      },
      {
        path: 'closed-requests',
        element: (
          <RequireRole roles={['accountant']}>
            <ClosedRequestsPage />
          </RequireRole>
        ),
      },
      {
        path: 'outside-mag',
        element: (
          <RequireRole roles={['director']}>
            <OutsideMagPage />
          </RequireRole>
        ),
      },
      {
        path: 'managers',
        element: (
          <RequireRole roles={['director']}>
            <ManagersPage />
          </RequireRole>
        ),
      },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
