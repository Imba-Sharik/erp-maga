import { QueryProvider } from './providers/query-provider'
import { ThemeProvider } from './providers/theme-provider'
import { AppRouter } from './router'

export function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryProvider>
        <AppRouter />
      </QueryProvider>
    </ThemeProvider>
  )
}
