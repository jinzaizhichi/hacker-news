import { podcastDescription, podcastTitle } from '@/config'
import { getPastDays } from '@/lib/utils'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import markdownit from 'markdown-it'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Podcast } from 'podcast'

const md = markdownit()

export const revalidate = 300

export async function GET(request: Request) {
  // 创建缓存键
  const cacheUrl = new URL(request.url)
  const cacheKey = new Request(cacheUrl.toString())
  const cache = typeof caches !== 'undefined' ? await caches.open('rss-feed-cache') : undefined

  if (cache) {
    const response = await cache.match(cacheKey)

    if (response) {
      // 如果有缓存，直接返回缓存的响应
      console.info('Returning cached RSS feed response')
      return response
    }
  }

  // 如果没有缓存，生成新的响应
  const headersList = await headers()
  const host = headersList.get('host')

  const feed = new Podcast({
    title: podcastTitle,
    description: podcastDescription,
    feedUrl: `https://${host}/rss.xml`,
    siteUrl: `https://${host}`,
    imageUrl: `https://${host}/logo.png`,
    language: 'zh-CN',
    pubDate: new Date(),
    ttl: 60,
    generator: podcastTitle,
    author: podcastTitle,
    categories: ['technology', 'news'],
    itunesImage: `https://${host}/logo.png`,
    itunesCategory: [{ text: 'Technology' }, { text: 'News' }],
  })

  const { env } = getCloudflareContext()
  const runEnv = env.NEXTJS_ENV
  const pastDays = getPastDays(10)
  const posts = (await Promise.all(
    pastDays.map(async (day) => {
      const post = await env.HACKER_NEWS_KV.get(`content:${runEnv}:hacker-news:${day}`, 'json')
      return post as unknown as Article
    }),
  )).filter(Boolean)

  for (const post of posts) {
    const audioInfo = await env.HACKER_NEWS_R2.head(post.audio)

    const links = post.stories.map(s => `<li><a href="${s.hackerNewsUrl || s.url || ''}">${s.title || ''}</a></li>`).join('')
    const linkContent = `<p><b>相关链接：</b></p><ul>${links}</ul>`
    const blogContentHtml = md.render(post.blogContent || '')
    const finalContent = `<div>${blogContentHtml}<hr/>${linkContent}</div>`

    feed.addItem({
      title: post.title || '',
      description: post.introContent || post.podcastContent || '',
      content: finalContent,
      url: `https://${host}/post/${post.date}`,
      guid: `https://${host}/post/${post.date}`,
      date: new Date(post.updatedAt || post.date),
      enclosure: {
        url: `${env.NEXT_STATIC_HOST}/${post.audio}?t=${post.updatedAt}`,
        type: 'audio/mpeg',
        size: audioInfo?.size,
      },
    })
  }

  const response = new NextResponse(feed.buildXml(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': `public, max-age=${revalidate}, s-maxage=${revalidate}`,
    },
  })

  if (cache) {
    const responseToCache = response.clone()

    await cache.put(cacheKey, responseToCache).catch((error) => {
      console.error('Failed to cache RSS feed:', error)
    })
  }

  return response
}
