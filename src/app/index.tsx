import { QueryProvider } from './providers/query-provider'
import { SessionBootstrap } from './providers/session-bootstrap'
import { ThemeProvider } from './providers/theme-provider'
import { AppRouter } from './router'

export function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryProvider>
        <SessionBootstrap />
        <AppRouter />
      </QueryProvider>
    </ThemeProvider>
  )
}
