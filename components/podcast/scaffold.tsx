'use client'

import type { PodcastInfo } from '@/types/podcast'
import { PodcastLayout } from '@/components/podcast/layout'

interface PodcastScaffoldProps {
  children: React.ReactNode
  podcastInfo: PodcastInfo
}

export function PodcastScaffold({ children, podcastInfo }: PodcastScaffoldProps) {
  return <PodcastLayout podcastInfo={podcastInfo}>{children}</PodcastLayout>
}
