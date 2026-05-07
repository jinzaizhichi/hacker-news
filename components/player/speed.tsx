'use client'

import { useMediaRemote, usePlaybackRateOptions } from '@vidstack/react'
import { useEffect, useState } from 'react'

export function Speed() {
  const options = usePlaybackRateOptions()
  const [speed, setSpeed] = useState(3)
  const remote = useMediaRemote()

  useEffect(() => {
    const option = options[speed]
    if (!option)
      return
    remote.changePlaybackRate(Number.parseFloat(option.value))
  }, [options, remote, speed])

  return (
    <button
      type="button"
      aria-label="切换播放速度"
      title="切换播放速度"
      className={`
        cursor-pointer rounded-md border px-2 py-1 text-xs transition-colors
        hover:bg-gray-100
        dark:hover:bg-white/10
      `}
      onClick={() => setSpeed(current => (current + 1) % options.length)}
    >
      {speed === 3 ? '1.0x' : options[speed]?.label}
    </button>
  )
}
