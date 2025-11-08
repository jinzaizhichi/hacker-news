'use client'

import type { ComponentType, SVGProps } from 'react'
import type { PodcastInfo as PodcastInfoData } from '@/types/podcast'
import { useStore } from '@tanstack/react-store'
import { Podcast, Rss, Youtube } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
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
  const { title, description, cover } = podcastInfo
  const shouldTruncate = description.length > site.defaultDescriptionLength
  const displayDescription = isExpanded
    ? description
    : shouldTruncate
      ? `${description.slice(0, site.defaultDescriptionLength)}...`
      : description

  return (
    <div className={cn('hidden md:flex', 'h-full flex-col gap-12 p-12')}>
      <Link href="/" className="block aspect-square w-full">
        <Image
          className="h-full w-full rounded-2xl object-cover"
          src={cover}
          alt="cover"
          width={640}
          height={640}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </Link>

      <div className="text-left font-bold text-xl">{title}</div>

      <div className="flex flex-col gap-10">
        <section className="flex flex-col gap-5">
          <div className="flex items-center gap-2 font-medium font-mono text-sm">
            <TinyWaveFormIcon
              colors={['fill-violet-300', 'fill-pink-300']}
              className="h-2.5 w-2.5"
            />
            <span>{t('podcastInfo.about')}</span>
          </div>
          <div className="flex flex-col gap-2">
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
              >
                {isExpanded ? t('podcastInfo.showLess') : t('podcastInfo.showMore')}
              </button>
            )}
          </div>
        </section>

        {podcast.platforms?.length
          ? (
              <section className="flex flex-col gap-5">
                <div className="flex items-center gap-2 font-medium font-mono text-sm">
                  <TinyWaveFormIcon
                    colors={['fill-indigo-300', 'fill-blue-300']}
                    className="h-2.5 w-2.5"
                  />
                  <span>{t('podcastInfo.listen')}</span>
                </div>

                <div className="flex flex-col gap-6">
                  {podcast.platforms.map((platform) => {
                    const config = platformIcons[platform.id]
                    if (!config)
                      return null
                    const Icon = config.icon
                    return (
                      <a
                        key={platform.id}
                        href={platform.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <Icon className={cn('h-6 w-6', config.colorClass)} />
                        <span>{platform.name}</span>
                      </a>
                    )
                  })}
                </div>
              </section>
            )
          : null}
      </div>
    </div>
  )
}

function PodcastInfoMobile({ podcastInfo }: PodcastInfoContentProps) {
  const { title, description, cover } = podcastInfo

  return (
    <div className="relative flex flex-col items-center gap-8 md:hidden">
      <Waveform className="absolute top-0 left-0 w-full" />
      <Link href="/" className="flex justify-center pt-20">
        <Image
          className="h-40 w-40 rounded-2xl object-cover"
          src={cover}
          alt="cover"
          width={320}
          height={320}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </Link>

      <div className="text-left font-bold text-2xl">{title}</div>

      <div className="line-clamp-2 px-10">{description}</div>

      {podcast.platforms?.length
        ? (
            <div className="flex items-center gap-6">
              {podcast.platforms.map((platform) => {
                const config = platformIcons[platform.id]
                if (!config)
                  return null
                const Icon = config.icon
                return (
                  <a
                    key={platform.id}
                    href={platform.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-opacity hover:opacity-70"
                    aria-label={platform.name}
                  >
                    <Icon className={cn('h-8 w-8', config.colorClass)} />
                  </a>
                )
              })}
            </div>
          )
        : null}

      <div className="relative w-full py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </div>
    </div>
  )
}
