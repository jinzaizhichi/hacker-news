'use client'

import type { MouseEvent } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
import { cn } from '@/lib/utils'
import { getPageStore } from '@/stores/page-store'

interface EpisodesPaginationProps {
  currentPage: number
  totalPages: number
}

export function EpisodesPagination({ currentPage, totalPages }: EpisodesPaginationProps) {
  const router = useRouter()

  const pages = useMemo(() => {
    const result: Array<{ type: 'page', value: number } | { type: 'ellipsis', key: string }> = []
    for (let page = 1; page <= totalPages; page += 1) {
      const showPage = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
      const showEllipsisBefore = page === 2 && currentPage > 3
      const showEllipsisAfter = page === totalPages - 1 && currentPage < totalPages - 2

      if (!showPage && !showEllipsisBefore && !showEllipsisAfter) {
        continue
      }

      if (showEllipsisBefore || showEllipsisAfter) {
        result.push({ type: 'ellipsis', key: `ellipsis-${page}` })
      }
      else {
        result.push({ type: 'page', value: page })
      }
    }
    return result
  }, [currentPage, totalPages])

  const scrollToTop = () => {
    setTimeout(() => {
      const mainContainer = document.getElementById('main-scroll-container')
      mainContainer?.scrollTo({ top: 0, behavior: 'auto' })
      window.scrollTo({ top: 0, behavior: 'auto' })
    }, 100)
  }

  const getPageHref = (page: number) => {
    return page <= 1 ? '/' : `/?page=${page}`
  }

  const setPage = (page: number) => {
    if (page === currentPage)
      return
    const url = getPageHref(page)
    router.push(url, { scroll: true })
    const pageStore = getPageStore()
    pageStore.setState(() => ({ currentPage: page }))
    scrollToTop()
  }

  const handlePageClick = (event: MouseEvent<HTMLAnchorElement>, page: number, disabled = false) => {
    if (disabled) {
      event.preventDefault()
      return
    }
    if (event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
      return
    }
    event.preventDefault()
    setPage(page)
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={`
      px-4 py-8
      md:px-10 md:py-12
      lg:px-20
    `}
    >
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink
              href={getPageHref(Math.max(1, currentPage - 1))}
              className={cn(
                'cursor-pointer',
                currentPage === 1 && 'opacity-50',
              )}
              aria-label="上一页"
              aria-disabled={currentPage === 1}
              tabIndex={currentPage === 1 ? -1 : undefined}
              onClick={event => handlePageClick(event, Math.max(1, currentPage - 1), currentPage === 1)}
            >
              <ChevronLeftIcon className="size-4" aria-hidden="true" />
            </PaginationLink>
          </PaginationItem>

          {pages.map((item) => {
            if (item.type === 'ellipsis') {
              return (
                <PaginationItem key={item.key}>
                  <PaginationEllipsis />
                </PaginationItem>
              )
            }

            const page = item.value
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href={getPageHref(page)}
                  isActive={page === currentPage}
                  className={cn(
                    'cursor-pointer',
                    page === currentPage && `
                      bg-theme text-white
                      hover:bg-theme-hover hover:text-white
                    `,
                  )}
                  onClick={event => handlePageClick(event, page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          <PaginationItem>
            <PaginationLink
              href={getPageHref(Math.min(totalPages, currentPage + 1))}
              className={cn(
                'cursor-pointer',
                currentPage === totalPages && 'opacity-50',
              )}
              aria-label="下一页"
              aria-disabled={currentPage === totalPages}
              tabIndex={currentPage === totalPages ? -1 : undefined}
              onClick={event => handlePageClick(event, Math.min(totalPages, currentPage + 1), currentPage === totalPages)}
            >
              <ChevronRightIcon className="size-4" aria-hidden="true" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
