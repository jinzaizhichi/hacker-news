import { env } from 'cloudflare:workers'
import { cache } from 'react'

export const getArticleByDate = cache(async (date: string): Promise<Article | null> => {
  const runEnv = env.NODE_ENV || 'production'
  return await env.HACKER_PODCAST_KV.get(`content:${runEnv}:hacker-podcast:${date}`, 'json') as unknown as Article | null
})
