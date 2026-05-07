'use client'

import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { externalLinks, podcast } from '@/config'
import { useIsClient } from '@/hooks/use-is-client'
import '@/styles/cmdk.css'

const platformIcons: Record<string, string> = {
  youtube: '▶️',
  apple: '🎙️',
  spotify: '🎧',
  xiaoyuzhou: '🌌',
  rss: '🟧',
}

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const isClient = useIsClient()

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [open])

  if (!isClient) {
    return null
  }

  const closeCommandMenu = () => {
    onOpenChange(false)
  }

  const navigateTo = (href: string) => {
    router.push(href, { scroll: true })
    closeCommandMenu()
  }

  const openLink = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer')
    closeCommandMenu()
  }

  return (
    <Command.Dialog
      className="raycast"
      open={open}
      onOpenChange={onOpenChange}
      label="命令"
      overlayClassName="command-menu-overlay"
      contentClassName="command-menu-content"
    >
      <div>
        <Command.Input
          ref={inputRef}
          aria-label="搜索命令，例如：首页、Spotify、GitHub…"
          name="command-search"
          autoComplete="off"
          placeholder="搜索命令，例如：首页、Spotify、GitHub…"
        />
      </div>
      <Command.List>
        <Command.Empty>未找到结果</Command.Empty>

        <Command.Group heading="导航">
          <Command.Item onSelect={() => navigateTo('/')}>
            <span aria-hidden="true">🏠</span>
            首页
            <span className="raycast-meta">↵</span>
          </Command.Item>
        </Command.Group>

        <Command.Separator />

        <Command.Group heading="收听平台">
          {podcast.platforms.map(platform => (
            <Command.Item
              key={platform.id}
              onSelect={() => openLink(platform.link)}
            >
              <span aria-hidden="true">{platformIcons[platform.id] ?? '🔗'}</span>
              {platform.name}
              <span className="raycast-meta">打开</span>
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Separator />

        <Command.Group heading="外部链接">
          <Command.Item onSelect={() => openLink(externalLinks.github)}>
            <span aria-hidden="true">⌘</span>
            GitHub 仓库
            <span className="raycast-meta">打开</span>
          </Command.Item>
          <Command.Item onSelect={() => openLink(externalLinks.rss)}>
            <span aria-hidden="true">📡</span>
            RSS 订阅
            <span className="raycast-meta">打开</span>
          </Command.Item>
        </Command.Group>
      </Command.List>

      <div className="raycast-footer">
        <div className="raycast-footer-left">
          <span>打开</span>
          <kbd>↵</kbd>
        </div>
        <div className="raycast-footer-right">
          <span>操作</span>
          <kbd>⌘</kbd>
          <kbd>K</kbd>
        </div>
      </div>
    </Command.Dialog>
  )
}
