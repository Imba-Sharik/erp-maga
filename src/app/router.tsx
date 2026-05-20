import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { RequireRole } from './guards/require-role'
import { AppLayout } from './layouts/app-layout'
import { CalendarPage } from '@/pages/calendar'
import { ClosingPage } from '@/pages/closing'
import { DashboardPage } from '@/pages/dashboard'
import { LoginPage } from '@/pages/login'
import { NotFoundPage } from '@/pages/not-found'
import { NotificationsPage } from '@/pages/notifications'
import { OutsideMagPage } from '@/pages/outside-mag'
import { ProfilePage } from '@/pages/profile'
import { ProjectDetailPage } from '@/pages/project-detail'
import { ProjectsPage } from '@/pages/projects'
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
      { index: true, element: <Navigate to="/projects" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
      { path: 'closing', element: <ClosingPage /> },
      {
        path: 'outside-mag',
        element: (
          <RequireRole roles={['director']}>
            <OutsideMagPage />
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
