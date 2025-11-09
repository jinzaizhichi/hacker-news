'use client'

import type { Components } from 'react-markdown'

import type { Episode } from '@/types/podcast'
import { useStore } from '@tanstack/react-store'
import { ChevronLeft, Pause, Play } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Waveform } from '@/components/common/waveform'
import { ImageLightbox, ImageWithLightbox } from '@/components/image-lightbox'
import { useLightbox } from '@/hooks/use-lightbox'
import { extractImagesFromMarkdown } from '@/lib/markdown'
import { cn } from '@/lib/utils'
import { getPageStore } from '@/stores/page-store'
import { getPlayerStore, pause, play, setCurrentEpisode } from '@/stores/player-store'
import '@/styles/episode.css'

interface EpisodeDetailProps {
  episode: Episode
  initialPage?: number
}

export function EpisodeDetail({ episode, initialPage }: EpisodeDetailProps) {
  const lightbox = useLightbox()
  const content = episode.content ?? episode.description ?? ''

  const images = useMemo(() => extractImagesFromMarkdown(content), [content])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    if (typeof initialPage === 'number') {
      const pageStore = getPageStore()
      pageStore.setState(() => ({ currentPage: initialPage }))
    }
  }, [initialPage])

  const markdownComponents: Partial<Components> = {
    a: ({ href, children }: { href?: string, children?: React.ReactNode }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-theme underline transition-colors hover:text-theme-hover"
      >
        {children}
      </a>
    ),
    img: ({ src, alt }: { src?: string, alt?: string }) => {
      if (!src)
        return null
      const index = images.findIndex(img => img.src === src)
      return (
        <ImageWithLightbox
          src={src}
          alt={alt}
          index={index >= 0 ? index : 0}
          onOpen={lightbox.open}
        />
      )
    },
  }

  return (
    <>
      <EpisodeDetailDesktop
        episode={episode}
        initialPage={initialPage}
        markdownComponents={markdownComponents}
      />
      <EpisodeDetailMobile
        episode={episode}
        initialPage={initialPage}
        markdownComponents={markdownComponents}
      />
      <ImageLightbox
        images={images}
        open={lightbox.isOpen}
        index={lightbox.currentIndex}
        onClose={lightbox.close}
        onViewChange={lightbox.setIndex}
      />
    </>
  )
}

interface DetailVariantProps extends EpisodeDetailProps {
  markdownComponents: Partial<Components>
}

function EpisodeDetailDesktop({ episode, markdownComponents, initialPage }: DetailVariantProps) {
  const { t, i18n } = useTranslation()
  const publishedDate = new Date(episode.published)
  const isoPublishedDate = publishedDate.toISOString()
  const headlineId = useId()
  const pageStore = getPageStore()
  const currentPage = useStore(pageStore, state => state.currentPage)
  const playerStore = getPlayerStore()
  const currentEpisode = useStore(playerStore, state => state.currentEpisode)
  const isPlaying = useStore(playerStore, state => state.isPlaying)

  const isCurrentEpisodePlaying = currentEpisode?.id === episode.id && isPlaying

  const handlePlayPause = () => {
    if (isCurrentEpisodePlaying) {
      pause()
    }
    else if (currentEpisode?.id === episode.id) {
      play()
    }
    else {
      setCurrentEpisode(episode)
    }
  }

  const resolvedPage = initialPage ?? currentPage
  const href = resolvedPage > 1 ? `/?page=${resolvedPage}` : '/'
  const articlePath = `/post/${episode.id}`

  return (
    <section className="hidden w-full flex-col md:flex" aria-labelledby={headlineId}>
      <header className="sticky top-0 z-10 border-border border-b bg-background">
        <Waveform className="h-24 w-full" />
        <nav aria-label={t('episodes.back')} className="absolute inset-0">
          <Link
            href={href}
            className={cn(
              'flex h-full items-center gap-2 px-10 lg:px-20',
              'text-base transition-colors hover:text-muted-foreground',
            )}
          >
            <ChevronLeft className="size-4" />
            <span className="font-bold">{t('episodes.back')}</span>
          </Link>
        </nav>
      </header>

      <article
        className="px-10 py-16 lg:px-20"
        itemScope
        itemType="https://schema.org/Article"
        aria-labelledby={headlineId}
      >
        <meta itemProp="url" content={articlePath} />
        <meta itemProp="inLanguage" content={i18n.language} />
        <header
          className={cn(
            'sticky top-24 z-20 -mx-10 flex items-center gap-6 border-b border-border/60 bg-background/95 px-10 py-8',
            'backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:-mx-20 lg:px-20',
          )}
        >
          <button
            type="button"
            onClick={handlePlayPause}
            className={cn(
              'group mt-2 flex h-18 w-18 flex-shrink-0 items-center justify-center rounded-full bg-theme',
              'shadow-lg shadow-theme/20 transition-all hover:scale-105 hover:bg-theme-hover hover:shadow-theme/30 hover:shadow-xl',
              'cursor-pointer focus:outline-none focus:ring-2 focus:ring-theme focus:ring-offset-2',
            )}
            aria-label={isCurrentEpisodePlaying ? t('episodes.pauseEpisode') : t('episodes.playEpisode')}
          >
            {isCurrentEpisodePlaying
              ? (
                  <Pause className="h-8 w-8 fill-white text-white" />
                )
              : (
                  <Play className="h-8 w-8 fill-white text-white" />
                )}
          </button>

          <div className="flex flex-col">
            <h1 id={headlineId} className="mt-2 font-bold text-4xl text-foreground" itemProp="headline">
              {episode.title}
            </h1>
            <time
              className="order-first font-mono text-muted-foreground text-sm leading-7"
              dateTime={isoPublishedDate}
              itemProp="datePublished"
            >
              {publishedDate.toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </header>

        <div className="episode-content" itemProp="articleBody">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {episode.content ?? episode.description ?? ''}
          </ReactMarkdown>
        </div>
      </article>
    </section>
  )
}

function EpisodeDetailMobile({ episode, markdownComponents, initialPage }: DetailVariantProps) {
  const { t, i18n } = useTranslation()
  const publishedDate = new Date(episode.published)
  const isoPublishedDate = publishedDate.toISOString()
  const headlineId = useId()
  const pageStore = getPageStore()
  const currentPage = useStore(pageStore, state => state.currentPage)
  const playerStore = getPlayerStore()
  const currentEpisode = useStore(playerStore, state => state.currentEpisode)
  const isPlaying = useStore(playerStore, state => state.isPlaying)

  const isCurrentEpisodePlaying = currentEpisode?.id === episode.id && isPlaying

  const handlePlayPause = () => {
    if (isCurrentEpisodePlaying) {
      pause()
    }
    else if (currentEpisode?.id === episode.id) {
      play()
    }
    else {
      setCurrentEpisode(episode)
    }
  }

  const resolvedPage = initialPage ?? currentPage
  const href = resolvedPage > 1 ? `/?page=${resolvedPage}` : '/'
  const articlePath = `/post/${episode.id}`

  return (
    <section className="flex w-full flex-col md:hidden" aria-labelledby={headlineId}>
      <header className="sticky top-0 z-10 h-14 w-full bg-background/95 backdrop-blur-md">
        <nav aria-label={t('episodes.back')} className="absolute inset-0">
          <Link
            href={href}
            className={cn(
              'flex h-full items-center justify-center gap-2',
              'cursor-pointer text-foreground text-sm transition-colors hover:text-muted-foreground',
            )}
          >
            <ChevronLeft className="size-4 text-foreground" />
            <span className="font-bold">{t('episodes.back')}</span>
          </Link>
        </nav>
      </header>

      <article
        className="p-8"
        itemScope
        itemType="https://schema.org/Article"
        aria-labelledby={headlineId}
      >
        <meta itemProp="url" content={articlePath} />
        <meta itemProp="inLanguage" content={i18n.language} />
        <header
          className={cn(
            'sticky top-14 z-20 -mx-8 flex items-center gap-4 border-b border-border/60 bg-background/95 px-8 py-6',
            'backdrop-blur supports-[backdrop-filter]:bg-background/80',
          )}
        >
          <button
            type="button"
            onClick={handlePlayPause}
            className={cn(
              'group mt-2 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-theme',
              'shadow-lg shadow-theme/20 transition-all hover:scale-105 hover:bg-theme-hover hover:shadow-theme/30 hover:shadow-xl',
              'cursor-pointer focus:outline-none focus:ring-2 focus:ring-theme focus:ring-offset-2',
            )}
            aria-label={isCurrentEpisodePlaying ? t('episodes.pauseEpisode') : t('episodes.playEpisode')}
          >
            {isCurrentEpisodePlaying
              ? (
                  <Pause className="h-6 w-6 fill-white text-white" />
                )
              : (
                  <Play className="h-6 w-6 fill-white text-white" />
                )}
          </button>

          <div className="flex flex-col">
            <h1 id={headlineId} className="mt-2 font-bold text-2xl text-foreground" itemProp="headline">
              {episode.title}
            </h1>
            <time
              className="order-first font-mono text-muted-foreground text-xs leading-7"
              dateTime={isoPublishedDate}
              itemProp="datePublished"
            >
              {publishedDate.toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </header>

        <div className="episode-content" itemProp="articleBody">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {episode.content ?? episode.description ?? ''}
          </ReactMarkdown>
        </div>
      </article>
    </section>
  )
}
