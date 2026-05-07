'use client'

import { useStore } from '@tanstack/react-store'
import {
  MediaPlayer,

  MediaProvider,
  useMediaPlayer,
  useMediaState,
} from '@vidstack/react'
import { useEffect } from 'react'
import { PlayerLayout } from '@/components/player/layout'
import { useEpisodeFullscreen } from '@/hooks/use-episode-fullscreen'
import { cn } from '@/lib/utils'
import { getPlayerStore, pause, play, setIsPlaying, setIsSourceChanging } from '@/stores/player-store'

function PlayerContent() {
  const player = useMediaPlayer()
  const playerStore = getPlayerStore()
  const currentEpisode = useStore(playerStore, state => state.currentEpisode)
  const isPlaying = useStore(playerStore, state => state.isPlaying)
  const canPlay = useMediaState('canPlay')

  useEffect(() => {
    if (canPlay) {
      setIsSourceChanging(false)
    }
  }, [canPlay])

  useEffect(() => {
    if (!player)
      return

    const handleCanPlay = () => {
      setIsSourceChanging(false)
    }
    const handlePlay = () => {
      setIsSourceChanging(false)
      setIsPlaying(true)
    }
    const handlePause = () => {
      if (!playerStore.state.isSourceChanging) {
        setIsPlaying(false)
      }
    }
    const handleEnded = () => {
      setIsSourceChanging(false)
      setIsPlaying(false)
    }

    player.addEventListener('can-play', handleCanPlay)
    player.addEventListener('play', handlePlay)
    player.addEventListener('pause', handlePause)
    player.addEventListener('ended', handleEnded)

    return () => {
      player.removeEventListener('can-play', handleCanPlay)
      player.removeEventListener('play', handlePlay)
      player.removeEventListener('pause', handlePause)
      player.removeEventListener('ended', handleEnded)
    }
  }, [player, playerStore])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== ' ' || event.repeat)
        return
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT'
        || target.tagName === 'TEXTAREA'
        || target.isContentEditable
      ) {
        return
      }
      event.preventDefault()
      if (currentEpisode) {
        if (isPlaying) {
          pause()
        }
        else {
          play()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentEpisode, isPlaying])

  return null
}

export function Player() {
  const playerStore = getPlayerStore()
  const currentEpisode = useStore(playerStore, state => state.currentEpisode)
  const isPlaying = useStore(playerStore, state => state.isPlaying)
  const { isFullscreen: isEpisodeFullscreen } = useEpisodeFullscreen()
  const hasPlayer = currentEpisode !== null
  const shouldShowPlayer = hasPlayer && !isEpisodeFullscreen

  return (
    <div
      className={cn(
        `
          episode-player fixed right-0 bottom-0 left-0 z-50
          pb-[env(safe-area-inset-bottom)]
        `,
        isEpisodeFullscreen
          ? `
            md:left-0
            lg:left-0
          `
          : `
            md:left-[24rem]
            lg:left-[28rem]
          `,
        `
          border-t bg-background/95 backdrop-blur
          supports-[backdrop-filter]:bg-background/60
        `,
        'transition-opacity duration-300',
        shouldShowPlayer
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0',
      )}
    >
      <MediaPlayer
        src={currentEpisode?.audio.src}
        paused={!isPlaying}
        viewType="audio"
        streamType="on-demand"
        logLevel="warn"
        playsInline
        title={currentEpisode?.title || ''}
        onPlayFail={(error) => {
          console.error('Failed to play:', error)
          setIsSourceChanging(false)
          setIsPlaying(false)
        }}
      >
        <MediaProvider />
        <PlayerContent />
        <PlayerLayout />
      </MediaPlayer>
    </div>
  )
}
