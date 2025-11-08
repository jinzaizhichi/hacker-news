'use client'

import type { Theme } from '@/stores/theme-store'
import { useStore } from '@tanstack/react-store'
import { useEffect } from 'react'
import { getThemeStore, initThemeStore } from '@/stores/theme-store'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'next-ui-theme',
}: ThemeProviderProps) {
  const themeStore = initThemeStore(defaultTheme, storageKey)
  const theme = useStore(themeStore, state => state.theme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const applySystemTheme = () => {
        root.classList.remove('light', 'dark')
        root.classList.add(mediaQuery.matches ? 'dark' : 'light')
      }

      applySystemTheme()
      mediaQuery.addEventListener('change', applySystemTheme)
      return () => mediaQuery.removeEventListener('change', applySystemTheme)
    }

    root.classList.add(theme)
    return undefined
  }, [theme])

  return <>{children}</>
}

export function useTheme() {
  const themeStore = getThemeStore()
  const theme = useStore(themeStore, state => state.theme)

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(themeStore.state.storageKey, newTheme)
    }
    catch (error) {
      console.error('Failed to persist theme', error)
    }

    themeStore.setState(state => ({ ...state, theme: newTheme }))
  }

  return { theme, setTheme }
}
