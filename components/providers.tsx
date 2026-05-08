'use client'

import type { ReactNode } from 'react'
import { useStore } from '@tanstack/react-store'
import { lazy, Suspense } from 'react'
import { ThemeProvider } from '@/components/theme/provider'
import { initPageStore } from '@/stores/page-store'
import { getPlayerStore, initPlayerStore } from '@/stores/player-store'
import { initThemeStore } from '@/stores/theme-store'
import { initUIStore } from '@/stores/ui-store'

const Player = lazy(() => import('@/components/player/index').then(module => ({ default: module.Player })))

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

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider storageKey="next-ui-theme">
      {children}
      <Suspense fallback={null}>
        <LazyPlayer />
      </Suspense>
    </ThemeProvider>
  )
}
