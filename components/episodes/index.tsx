'use client'

import type { Episode } from '@/types/podcast'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Waveform } from '@/components/common/waveform'
import { EpisodeItem } from '@/components/episodes/episode-item'
import { EpisodesPagination } from '@/components/episodes/pagination'
import { site } from '@/config'
import { getPageStore } from '@/stores/page-store'

interface EpisodesProps {
  episodes: Episode[]
  currentPage: number
  totalEpisodes: number
}

export function Episodes({ episodes, currentPage, totalEpisodes }: EpisodesProps) {
  useEffect(() => {
    const pageStore = getPageStore()
    pageStore.setState(() => ({ currentPage }))
  }, [currentPage])

  const pageSize = site.pageSize
  const totalPages = Math.max(1, Math.ceil(totalEpisodes / pageSize))
  const hasEpisodes = episodes.length > 0

  return (
    <>
      <EpisodesDesktop
        episodes={episodes}
        totalPages={totalPages}
        currentPage={currentPage}
        hasEpisodes={hasEpisodes}
      />
      <EpisodesMobile
        episodes={episodes}
        totalPages={totalPages}
        currentPage={currentPage}
        hasEpisodes={hasEpisodes}
      />
    </>
  )
}

interface EpisodesSectionProps {
  episodes: Episode[]
  totalPages: number
  currentPage: number
  hasEpisodes: boolean
}

function EpisodesDesktop({ episodes, totalPages, currentPage, hasEpisodes }: EpisodesSectionProps) {
  const { t } = useTranslation()

  return (
    <div className="hidden w-full flex-col md:flex">
      <div className="sticky top-0 z-10 border-border border-b bg-background">
        <Waveform className="h-24 w-full" />
        <h1 className="absolute inset-0 top-10 px-10 font-bold text-2xl lg:px-20">
          {t('episodes.title')}
        </h1>
      </div>

      {!hasEpisodes
        ? (
            <p className="px-10 text-muted-foreground lg:px-20">
              {t('episodes.noEpisodes')}
            </p>
          )
        : (
            <>
              <ul className="flex flex-col">
                {episodes.map(episode => (
                  <EpisodeItem key={episode.id} episode={episode} variant="desktop" />
                ))}
              </ul>
              <EpisodesPagination
                currentPage={currentPage}
                totalPages={totalPages}
                paddingClassName="px-10 lg:px-20 py-12"
              />
            </>
          )}
    </div>
  )
}

function EpisodesMobile({ episodes, totalPages, currentPage, hasEpisodes }: EpisodesSectionProps) {
  const { t } = useTranslation()

  return (
    <div className="flex w-full flex-col md:hidden">
      {!hasEpisodes
        ? (
            <p className="px-4 py-8 text-muted-foreground">{t('episodes.noEpisodes')}</p>
          )
        : (
            <>
              <ul className="flex flex-col">
                {episodes.map(episode => (
                  <EpisodeItem key={episode.id} episode={episode} variant="mobile" />
                ))}
              </ul>
              <EpisodesPagination
                currentPage={currentPage}
                totalPages={totalPages}
                paddingClassName="px-4 py-8"
              />
            </>
          )}
    </div>
  )
}
