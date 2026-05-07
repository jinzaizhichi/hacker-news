'use client'

import type { MediaPlayerInstance } from '@vidstack/react'
import { useStore } from '@tanstack/react-store'
import {
  MediaPlayer,

  MediaProvider,
  useMediaPlayer,
  useMediaState,
} from '@vidstack/react'
import { useEffect, useRef } from 'react'
import { PlayerLayout } from '@/components/player/layout'
import { useEpisodeFullscreen } from '@/hooks/use-episode-fullscreen'
import { cn } from '@/lib/utils'
import { getPlayerStore, registerPlayerInstance, setIsPlaying } from '@/stores/player-store'

function PlayerContent() {
  const player = useMediaPlayer()
  const playerStore = getPlayerStore()
  const currentEpisode = useStore(playerStore, state => state.currentEpisode)
  const canPlay = useMediaState('canPlay')
  const paused = useMediaState('paused')
  const previousEpisodeIdRef = useRef(currentEpisode?.id)
  const isSourceChanging = useRef(false)

  useEffect(() => {
    if (player) {
      registerPlayerInstance(player)
    }
  }, [player])

  useEffect(() => {
    if (!player)
      return

    const handleSourceChange = () => {
      isSourceChanging.current = true
    }
    const handleCanPlay = () => {
      isSourceChanging.current = false
    }
    const handlePlay = () => {
      isSourceChanging.current = false
      setIsPlaying(true)
    }
    const handlePause = () => {
      if (!isSourceChanging.current) {
        setIsPlaying(false)
      }
    }
    const handleEnded = () => setIsPlaying(false)

    player.addEventListener('source-change', handleSourceChange)
    player.addEventListener('can-play', handleCanPlay)
    player.addEventListener('play', handlePlay)
    player.addEventListener('pause', handlePause)
    player.addEventListener('ended', handleEnded)

    return () => {
      player.removeEventListener('source-change', handleSourceChange)
      player.removeEventListener('can-play', handleCanPlay)
      player.removeEventListener('play', handlePlay)
      player.removeEventListener('pause', handlePause)
      player.removeEventListener('ended', handleEnded)
    }
  }, [player])

  useEffect(() => {
    if (currentEpisode?.id !== previousEpisodeIdRef.current) {
      isSourceChanging.current = true
      previousEpisodeIdRef.current = currentEpisode?.id
    }
  }, [currentEpisode?.id])

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
      if (player && currentEpisode && canPlay) {
        if (paused) {
          player.play().catch((error) => {
            console.error('Failed to play:', error)
            setIsPlaying(false)
          })
        }
        else {
          player.pause().catch((error) => {
            console.error('Failed to pause:', error)
          })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [player, currentEpisode, paused, canPlay])

  return null
}

export function Player() {
  const playerRef = useRef<MediaPlayerInstance>(null)
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
        ref={playerRef}
        src={currentEpisode?.audio.src || ''}
        autoPlay={isPlaying}
        paused={!isPlaying}
        viewType="audio"
        streamType="on-demand"
        logLevel="warn"
        playsInline
        title={currentEpisode?.title || ''}
        onAutoPlayFail={(detail) => {
          console.error('Failed to autoplay:', detail.error)
          setIsPlaying(false)
        }}
        onPlayFail={(error, event) => {
          if (event.autoPlay)
            return
          console.error('Failed to play:', error)
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
