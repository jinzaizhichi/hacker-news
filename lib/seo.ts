import { podcast } from '@/config'

const metadataDescriptionLength = 160

export function getBaseUrl(): string {
  return podcast.base.link.replace(/\/$/, '')
}

export function getAbsoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  return `${getBaseUrl()}/${path.replace(/^\//, '')}`
}

export function cleanMetadataDescription(description: string): string {
  const cleaned = description
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (cleaned.length <= metadataDescriptionLength) {
    return cleaned
  }

  return `${cleaned.slice(0, metadataDescriptionLength).trim()}…`
}
