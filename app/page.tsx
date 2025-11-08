import type { PodcastInfo } from '@/types/podcast'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { Podcast } from '@/components/podcast'
import { keepDays, podcast, site } from '@/config'
import { buildEpisodesFromArticles } from '@/lib/episodes'
import { getPastDays } from '@/lib/utils'

export const revalidate = 600

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { env } = await getCloudflareContext({ async: true })
  const runEnv = env.NEXTJS_ENV
  const pastDays = getPastDays(keepDays)
  const query = await searchParams
  const requestedPage = Number.parseInt(query.page ?? '1', 10)
  const currentPage = Number.isNaN(requestedPage) ? 1 : Math.max(1, requestedPage)

  const posts = (
    await Promise.all(
      pastDays.map(async (day) => {
        const post = await env.HACKER_NEWS_KV.get(`content:${runEnv}:hacker-news:${day}`, 'json')
        return post as unknown as Article
      }),
    )
  ).filter(Boolean)

  const episodes = buildEpisodesFromArticles(posts, env.NEXT_STATIC_HOST)
  const totalPages = Math.max(1, Math.ceil(episodes.length / site.pageSize))
  const safePage = Math.min(currentPage, totalPages)

  const podcastInfo: PodcastInfo = {
    title: podcast.base.title,
    description: podcast.base.description,
    link: podcast.base.link,
    cover: podcast.base.cover,
  }

  return (
    <Podcast
      episodes={episodes}
      currentPage={safePage}
      podcastInfo={podcastInfo}
    />
  )
}
