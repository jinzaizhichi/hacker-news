'use client'

import Zoom from 'react-medium-image-zoom'

interface ImageZoomProps {
  src: string
  alt?: string
  index: number
}

export function ImageZoom({ src, alt, index }: ImageZoomProps) {
  const resolvedAlt = alt || `第 ${index + 1} 张图片`

  return (
    <div className="relative my-6 w-full max-w-full rounded-lg shadow-md">
      <Zoom
        a11yNameButtonZoom="放大图片"
        a11yNameButtonUnzoom="缩小图片"
        zoomMargin={24}
      >
        <img
          src={src}
          alt={resolvedAlt}
          width={1200}
          height={800}
          className="h-auto w-full rounded-lg object-contain"
          loading={index === 0 ? 'eager' : 'lazy'}
        />
      </Zoom>
    </div>
  )
}
