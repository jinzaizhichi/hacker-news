'use client'

import { useEffect, useRef, useState } from 'react'

export function useLightboxAnimation(open: boolean) {
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (open) {
      setMounted(true)
      setIsVisible(false)
      const rafId = requestAnimationFrame(() => {
        setIsVisible(true)
      })
      return () => cancelAnimationFrame(rafId)
    }
    else {
      setIsVisible(false)
      timeoutRef.current = setTimeout(() => {
        setMounted(false)
      }, 300)
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }
    }
  }, [open])

  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return { isVisible, mounted }
}
