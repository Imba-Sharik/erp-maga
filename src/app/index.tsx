import { Toaster } from '@/shared/ui/toast'

import { QueryProvider } from './providers/query-provider'
import { ThemeProvider } from './providers/theme-provider'
import { AppRouter } from './router'

export function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryProvider>
        <AppRouter />
        <Toaster />
      </QueryProvider>
    </ThemeProvider>
  )
}
