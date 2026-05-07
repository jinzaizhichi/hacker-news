'use client'

import { Command, Github } from 'lucide-react'
import { Fragment } from 'react'
import { ThemeToggle } from '@/components/theme/toggle'
import { externalLinks, podcast } from '@/config'
import { setCommandMenuOpen } from '@/stores/ui-store'

export function PodcastAside() {
  return (
    <aside className={`
      flex h-full flex-col items-center justify-between px-4 py-8
    `}
    >
      <section className={`
        sticky top-0 flex items-center gap-6 py-4 whitespace-nowrap
        [writing-mode:vertical-rl]
      `}
      >
        <span className="font-mono text-muted-foreground">主 播</span>
        <span className="flex gap-6 font-bold">
          {podcast.hosts.map((host, index) => (
            <Fragment key={host.name}>
              {index !== 0 && (
                <span aria-hidden="true" className="text-muted-foreground">
                  /
                </span>
              )}
              <a
                href={host.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  cursor-pointer transition-colors
                  hover:text-theme
                `}
                title={`访问 ${host.name} 的主页`}
                aria-label={`访问 ${host.name} 的主页`}
              >
                {host.name}
              </a>
            </Fragment>
          ))}
        </span>
      </section>
      <section className="flex flex-col items-center gap-5">
        <button
          type="button"
          onClick={() => setCommandMenuOpen(true)}
          className={`
            cursor-pointer transition-colors
            hover:text-theme
          `}
          title="打开命令菜单"
          aria-label="打开命令菜单"
        >
          <Command className="size-6" aria-hidden="true" />
        </button>
        <a
          href={externalLinks.github}
          target="_blank"
          rel="noopener noreferrer"
          className={`
            cursor-pointer transition-colors
            hover:text-theme
          `}
          title="打开 GitHub 仓库"
          aria-label="打开 GitHub 仓库"
        >
          <Github className="size-6" />
        </a>
        <ThemeToggle />
      </section>
    </aside>
  )
}
