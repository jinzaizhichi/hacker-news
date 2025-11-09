'use client'

import type { ComponentType, SVGProps } from 'react'
import type { PodcastInfo as PodcastInfoData } from '@/types/podcast'
import { useStore } from '@tanstack/react-store'
import { Podcast, Rss, Youtube } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Waveform } from '@/components/common/waveform'
import { TinyWaveFormIcon } from '@/components/common/waveform-icon'
import { podcast, site } from '@/config'
import { cn } from '@/lib/utils'
import { getPodcastStore } from '@/stores/podcast-store'

interface PlatformConfig {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  colorClass: string
}

const platformIcons: Record<string, PlatformConfig> = {
  youtube: {
    icon: Youtube,
    colorClass: 'text-red-500 hover:text-red-600',
  },
  apple: {
    icon: Podcast,
    colorClass: 'text-purple-500 hover:text-purple-600',
  },
  rss: {
    icon: Rss,
    colorClass: 'text-orange-500 hover:text-orange-600',
  },
}

interface PodcastInfoContentProps {
  podcastInfo: PodcastInfoData
}

export function PodcastInfo() {
  const podcastStore = getPodcastStore()
  const podcastInfo = useStore(podcastStore, state => state.podcastInfo)

  if (!podcastInfo) {
    return null
  }

  return (
    <>
      <PodcastInfoDesktop podcastInfo={podcastInfo} />
      <PodcastInfoMobile podcastInfo={podcastInfo} />
    </>
  )
}

function PodcastInfoDesktop({ podcastInfo }: PodcastInfoContentProps) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const titleId = useId()
  const aboutSectionId = useId()
  const listenSectionId = useId()
  const descriptionId = useId()
  const { title, description, cover } = podcastInfo
  const coverAlt = t('podcastInfo.coverAlt', { title })
  const shouldTruncate = description.length > site.defaultDescriptionLength
  const displayDescription = isExpanded
    ? description
    : shouldTruncate
      ? `${description.slice(0, site.defaultDescriptionLength)}...`
      : description

  return (
    <article
      className={cn('hidden md:flex', 'h-full flex-col gap-12 p-12')}
      aria-labelledby={titleId}
      itemScope
      itemType="https://schema.org/PodcastSeries"
    >
      <meta itemProp="url" content={podcast.base.link} />
      <figure className="block aspect-square w-full">
        <Link href="/" aria-label={title}>
          <Image
            className="h-full w-full rounded-2xl object-cover"
            src={cover}
            alt={coverAlt}
            width={640}
            height={640}
            referrerPolicy="no-referrer"
            preload
            itemProp="image"
          />
        </Link>
        <figcaption className="sr-only">{title}</figcaption>
      </figure>

      <h2 id={titleId} className="text-left font-bold text-xl" itemProp="name">
        {title}
      </h2>

      <div className="flex flex-col gap-10">
        <section className="flex flex-col gap-5" aria-labelledby={aboutSectionId}>
          <div className="flex items-center gap-2 font-medium font-mono text-sm" id={aboutSectionId}>
            <TinyWaveFormIcon
              colors={['fill-violet-300', 'fill-pink-300']}
              className="h-2.5 w-2.5"
              aria-hidden="true"
            />
            <span>{t('podcastInfo.about')}</span>
          </div>
          <div className="flex flex-col gap-2" id={descriptionId} itemProp="description">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="leading-relaxed">{children}</p>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-theme underline transition-colors hover:text-theme-hover"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {displayDescription}
            </ReactMarkdown>
            {shouldTruncate && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="cursor-pointer self-start font-medium text-theme transition-colors hover:text-theme-hover"
                aria-expanded={isExpanded}
                aria-controls={descriptionId}
              >
                {isExpanded ? t('podcastInfo.showLess') : t('podcastInfo.showMore')}
              </button>
            )}
          </div>
        </section>

        {podcast.platforms?.length
          ? (
              <section className="flex flex-col gap-5" aria-labelledby={listenSectionId}>
                <div className="flex items-center gap-2 font-medium font-mono text-sm" id={listenSectionId}>
                  <TinyWaveFormIcon
                    colors={['fill-indigo-300', 'fill-blue-300']}
                    className="h-2.5 w-2.5"
                    aria-hidden="true"
                  />
                  <span>{t('podcastInfo.listen')}</span>
                </div>

                <ul className="flex flex-col gap-6">
                  {podcast.platforms.map((platform) => {
                    const config = platformIcons[platform.id]
                    if (!config)
                      return null
                    const Icon = config.icon
                    return (
                      <li key={platform.id} className="list-none">
                        <a
                          href={platform.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex cursor-pointer items-center gap-2"
                          aria-label={platform.name}
                          itemProp="sameAs"
                        >
                          <Icon className={cn('h-6 w-6', config.colorClass)} aria-hidden="true" />
                          <span>{platform.name}</span>
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          : null}
      </div>
    </article>
  )
}

function PodcastInfoMobile({ podcastInfo }: PodcastInfoContentProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const aboutSectionId = useId()
  const listenSectionId = useId()
  const { title, description, cover } = podcastInfo
  const coverAlt = t('podcastInfo.coverAlt', { title })

  return (
    <article
      className="relative flex flex-col items-center gap-8 md:hidden"
      aria-labelledby={titleId}
      itemScope
      itemType="https://schema.org/PodcastSeries"
    >
      <meta itemProp="url" content={podcast.base.link} />
      <Waveform className="absolute top-0 left-0 w-full" aria-hidden="true" />
      <figure className="flex justify-center pt-20">
        <Link href="/" aria-label={title}>
          <Image
            className="h-40 w-40 rounded-2xl object-cover"
            src={cover}
            alt={coverAlt}
            width={320}
            height={320}
            referrerPolicy="no-referrer"
            preload
            itemProp="image"
          />
        </Link>
        <figcaption className="sr-only">{title}</figcaption>
      </figure>

      <h2 id={titleId} className="text-left font-bold text-2xl" itemProp="name">
        {title}
      </h2>

      <section className="w-full px-10" aria-labelledby={aboutSectionId} itemProp="description">
        <h3 id={aboutSectionId} className="sr-only">
          {t('podcastInfo.about')}
        </h3>
        <div className="line-clamp-6">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="leading-relaxed">{children}</p>,
            }}
          >
            {description}
          </ReactMarkdown>
        </div>
      </section>

      {podcast.platforms?.length
        ? (
            <section className="flex flex-col items-center gap-4" aria-labelledby={listenSectionId}>
              <h3 id={listenSectionId} className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                {t('podcastInfo.listen')}
              </h3>
              <ul className="flex items-center gap-6">
                {podcast.platforms.map((platform) => {
                  const config = platformIcons[platform.id]
                  if (!config)
                    return null
                  const Icon = config.icon
                  return (
                    <li key={platform.id} className="list-none">
                      <a
                        href={platform.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-opacity hover:opacity-70"
                        aria-label={platform.name}
                        itemProp="sameAs"
                      >
                        <Icon className={cn('h-8 w-8', config.colorClass)} aria-hidden="true" />
                      </a>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        : null}

      <div className="relative w-full py-2" aria-hidden="true">
        <div className="absolute inset-0 flex items-center">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </div>
    </article>
  )
}
