'use client'

import type { Locale } from '@/i18n/config'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/theme/provider'
import { useIsClient } from '@/hooks/use-is-client'
import i18n from '@/i18n'
import '@/styles/cmdk.css'

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const isClient = useIsClient()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen(prev => !prev)
      }
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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

  const resolveTheme = () => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    return theme
  }

  const toggleTheme = () => {
    const nextTheme = resolveTheme() === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  const toggleLanguage = () => {
    const current = (i18n.language as Locale) || 'zh'
    const nextLang: Locale = current === 'zh' ? 'en' : 'zh'
    i18n.changeLanguage(nextLang)
    setOpen(false)
  }

  const navigateHome = () => {
    router.push('/', { scroll: true })
    setOpen(false)
  }

  const currentLocale = (i18n.language as Locale) || 'zh'
  const currentTheme = resolveTheme()

  if (!open) {
    return null
  }

  return (
    <div
      className="command-menu-overlay"
      onClick={() => setOpen(false)}
    >
      <div
        className="command-menu-content"
        onClick={e => e.stopPropagation()}
      >
        <div className="raycast">
          <Command>
            <div>
              <Command.Input
                ref={inputRef}
                placeholder={t('cmdk.searchPlaceholder')}
              />
            </div>
            <Command.List>
              <Command.Empty>{t('cmdk.noResults')}</Command.Empty>

              <Command.Group heading={t('cmdk.suggestions')}>
                <Command.Item onSelect={toggleTheme}>
                  <span>🌓</span>
                  {t('cmdk.toggle')}
                  {' '}
                  {currentTheme === 'dark' ? t('cmdk.light') : t('cmdk.dark')}
                  {' '}
                  {t('cmdk.mode')}
                  <span className="raycast-meta">⌘K</span>
                </Command.Item>
                <Command.Item onSelect={toggleLanguage}>
                  <span>🌐</span>
                  {t('cmdk.switchTo')}
                  {' '}
                  {currentLocale === 'zh' ? t('cmdk.en') : t('cmdk.zh')}
                  <span className="raycast-meta">⌘L</span>
                </Command.Item>
              </Command.Group>

              <Command.Separator />

              <Command.Group heading={t('cmdk.commands')}>
                <Command.Item onSelect={navigateHome}>
                  <span>🏠</span>
                  {t('common.home')}
                  <span className="raycast-meta">↵</span>
                </Command.Item>
              </Command.Group>
            </Command.List>

            <div className="raycast-footer">
              <div className="raycast-footer-left">
                <span>{t('cmdk.openApplication')}</span>
                <kbd>↵</kbd>
              </div>
              <div className="raycast-footer-right">
                <span>{t('cmdk.actions')}</span>
                <kbd>⌘</kbd>
                <kbd>K</kbd>
              </div>
            </div>
          </Command>
        </div>
      </div>
    </div>
  )
}
