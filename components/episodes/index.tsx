'use client'

import type { Episode } from '@/types/podcast'
import { useEffect, useId } from 'react'
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

  const headingId = useId()
  const listHeadingId = useId()
  const pageSize = site.pageSize
  const totalPages = Math.max(1, Math.ceil(totalEpisodes / pageSize))
  const hasEpisodes = episodes.length > 0

  return (
    <section className="flex w-full flex-col" aria-labelledby={headingId}>
      <header className={`
        md:backdrop-blur-0 md:bg-background
        sticky top-0 z-10 border-b border-border bg-background/95
        backdrop-blur-lg
      `}
      >
        <div className="relative flex items-center">
          <Waveform
            className={`
              hidden h-24 w-full
              md:block
            `}
            aria-hidden="true"
          />
          <h2
            id={headingId}
            className={`
              px-4 py-6 text-xl font-bold text-pretty
              md:absolute md:inset-0 md:top-10 md:px-10 md:py-0 md:text-2xl
              lg:px-20
            `}
          >
            节目列表
          </h2>
        </div>
      </header>

      <div className={`
        px-4 pt-6
        md:px-10 md:pt-12
        lg:px-20
      `}
      >
        <h3
          id={listHeadingId}
          className={`
            text-lg font-semibold text-pretty text-foreground
            md:text-xl
          `}
        >
          最近更新
        </h3>
      </div>

      {!hasEpisodes
        ? (
            <p
              className={`
                px-4 py-8 text-center text-muted-foreground
                md:px-10 md:py-20
                lg:px-20
              `}
              role="status"
            >
              暂无节目
            </p>
          )
        : (
            <>
              <ul className="flex flex-col" aria-labelledby={listHeadingId}>
                {episodes.map(episode => (
                  <EpisodeItem key={episode.id} episode={episode} />
                ))}
              </ul>
              <EpisodesPagination currentPage={currentPage} totalPages={totalPages} />
            </>
          )}
    </section>
  )
}
