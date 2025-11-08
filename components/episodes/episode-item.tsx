'use client'

import type { Episode } from '@/types/podcast'
import { useStore } from '@tanstack/react-store'
import { Pause, Play } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { getPageStore } from '@/stores/page-store'
import { getPlayerStore, pause, play, setCurrentEpisode } from '@/stores/player-store'

interface EpisodeItemProps {
  episode: Episode
  variant: 'desktop' | 'mobile'
}

export function EpisodeItem({ episode, variant }: EpisodeItemProps) {
  const { t, i18n } = useTranslation()
  const pageStore = getPageStore()
  const currentPage = useStore(pageStore, state => state.currentPage)
  const playerStore = getPlayerStore()
  const currentEpisode = useStore(playerStore, state => state.currentEpisode)
  const isPlaying = useStore(playerStore, state => state.isPlaying)

  const isCurrentEpisode = currentEpisode?.id === episode.id
  const isCurrentlyPlaying = isCurrentEpisode && isPlaying

  const handlePlayPause = () => {
    if (isCurrentlyPlaying) {
      pause()
    }
    else if (isCurrentEpisode) {
      play()
    }
    else {
      setCurrentEpisode(episode)
    }
  }

  const dateFormatter = new Date(episode.published).toLocaleDateString(
    i18n.language === 'zh' ? 'zh-CN' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' },
  )

  const linkHref = currentPage > 1 ? `/post/${episode.id}?page=${currentPage}` : `/post/${episode.id}`
  const isDesktop = variant === 'desktop'

  return (
    <li
      className={cn(
        'flex flex-col gap-3 border-border border-b',
        isDesktop ? 'px-10 py-12 lg:px-20' : 'p-8',
      )}
    >
      <time className={cn('text-muted-foreground', isDesktop ? 'text-sm' : 'text-xs')}>
        {dateFormatter}
      </time>
      <Link
        href={linkHref}
        className={cn(
          'cursor-pointer font-bold transition-colors hover:text-theme',
          isDesktop ? 'text-2xl' : 'text-xl',
        )}
      >
        {episode.title}
      </Link>
      {episode.description && (
        <Link
          href={linkHref}
          className={cn(
            'line-clamp-2 cursor-pointer text-foreground/80 leading-relaxed transition-colors hover:text-theme',
            !isDesktop && 'text-sm',
          )}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{episode.description}</ReactMarkdown>
        </Link>
      )}
      <div
        className={cn(
          'mt-2 flex items-center font-medium text-theme hover:text-theme-hover',
          isDesktop ? 'gap-4 text-sm' : 'flex-wrap gap-3 text-xs',
        )}
      >
        <button
          type="button"
          onClick={handlePlayPause}
          className={cn('flex cursor-pointer items-center gap-2 font-medium text-theme hover:text-theme-hover', !isDesktop && 'gap-1.5')}
        >
          {isCurrentlyPlaying ? <Pause className={cn(isDesktop ? 'size-4' : 'size-3.5')} /> : <Play className={cn(isDesktop ? 'size-4' : 'size-3.5')} />}
          <span>{isCurrentlyPlaying ? t('episodes.pause') : t('episodes.listen')}</span>
        </button>
        <span className="text-muted-foreground">/</span>
        <Link href={linkHref} className="cursor-pointer font-medium text-theme hover:text-theme-hover">
          {t('episodes.showNotes')}
        </Link>
      </div>
    </li>
  )
}
