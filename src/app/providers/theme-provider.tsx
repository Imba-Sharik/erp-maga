import { useEffect, useState, type ReactNode } from 'react'

import { ThemeProviderContext, type Theme } from './theme-context'

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'erp-theme',
}: {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  )

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    const applied =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme

    root.classList.add(applied)
  }, [theme])

  return (
    <ThemeProviderContext.Provider
      value={{
        theme,
        setTheme: (next: Theme) => {
          localStorage.setItem(storageKey, next)
          setTheme(next)
        },
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  )
}
