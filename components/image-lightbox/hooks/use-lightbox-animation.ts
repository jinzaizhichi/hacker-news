'use client'

import { useEffect, useEffectEvent, useRef, useState } from 'react'

export function useLightboxAnimation(open: boolean) {
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const clearPendingTimeout = useEffectEvent(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  })

  const handleOpen = useEffectEvent(() => {
    let visibilityRaf: number | null = null
    const mountRaf = requestAnimationFrame(() => {
      setMounted(true)
      visibilityRaf = requestAnimationFrame(() => {
        setIsVisible(true)
      })
    })

    return () => {
      cancelAnimationFrame(mountRaf)
      if (visibilityRaf)
        cancelAnimationFrame(visibilityRaf)
    }
  })

  const handleClose = useEffectEvent(() => {
    const hideRaf = requestAnimationFrame(() => {
      setIsVisible(false)
    })

    timeoutRef.current = setTimeout(() => {
      setMounted(false)
    }, 300)

    return () => {
      cancelAnimationFrame(hideRaf)
      clearPendingTimeout()
    }
  })

  useEffect(() => {
    clearPendingTimeout()
    if (open)
      return handleOpen()
    return handleClose()
  }, [open])

  useEffect(() => () => {
    clearPendingTimeout()
  }, [])

  return { isVisible, mounted }
}
