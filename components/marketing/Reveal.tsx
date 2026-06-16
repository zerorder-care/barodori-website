'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export function Reveal({
  children,
  className = '',
  delayMs = 0,
}: {
  children: ReactNode
  className?: string
  delayMs?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // 접근성/폴백: IntersectionObserver가 없으면 즉시 표시한다.
    if (typeof IntersectionObserver === 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true)
      return
    }
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
            break
          }
        }
      },
      // 요소가 10%만 보여도 진입으로 보고, 뷰포트 하단 10% 못 미쳐 미리 트리거
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-visible={visible}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={`transition duration-700 ease-out motion-safe:translate-y-3 motion-safe:opacity-0 motion-safe:data-[visible=true]:translate-y-0 motion-safe:data-[visible=true]:opacity-100 ${className}`}
    >
      {children}
    </div>
  )
}
