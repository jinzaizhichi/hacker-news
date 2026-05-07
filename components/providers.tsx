'use client'

import type { ReactNode } from 'react'
import { useStore } from '@tanstack/react-store'
import { lazy, Suspense, useEffect } from 'react'
import { ThemeProvider } from '@/components/theme/provider'
import { initPageStore } from '@/stores/page-store'
import { getPlayerStore, initPlayerStore } from '@/stores/player-store'
import { initThemeStore } from '@/stores/theme-store'
import { getUIStore, initUIStore, setCommandMenuOpen, toggleCommandMenuOpen } from '@/stores/ui-store'

const Player = lazy(() => import('@/components/player/index').then(module => ({ default: module.Player })))
const CommandMenu = lazy(() => import('@/components/cmdk/command-menu').then(module => ({ default: module.CommandMenu })))

initThemeStore()
initPlayerStore()
initPageStore()
initUIStore()

interface ProvidersProps {
  children: ReactNode
}

function LazyPlayer() {
  const playerStore = getPlayerStore()
  const currentEpisode = useStore(playerStore, state => state.currentEpisode)

  if (!currentEpisode) {
    return null
  }

  return <Player />
}

function LazyCommandMenu() {
  const uiStore = getUIStore()
  const hasCommandMenuLoaded = useStore(uiStore, state => state.hasCommandMenuLoaded)
  const isCommandMenuOpen = useStore(uiStore, state => state.isCommandMenuOpen)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleCommandMenuOpen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!hasCommandMenuLoaded && !isCommandMenuOpen) {
    return null
  }

  return <CommandMenu open={isCommandMenuOpen} onOpenChange={setCommandMenuOpen} />
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider storageKey="next-ui-theme">
      {children}
      <Suspense fallback={null}>
        <LazyPlayer />
        <LazyCommandMenu />
      </Suspense>
    </ThemeProvider>
  )
}
