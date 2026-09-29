'use client'

import Link, { type LinkProps } from 'next/link'
import { type MouseEvent, type ReactNode } from 'react'
import { track } from '@/lib/analytics'

type Props = LinkProps & {
  event: string
  eventProps?: Record<string, unknown>
  className?: string
  children: ReactNode
  external?: boolean
  /** 계측을 보낸 뒤에 이어서 실행한다. 메뉴 닫기 같은 호출부 동작을 잃지 않게 한다. */
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

export function TrackedLink({ event, eventProps, external, children, onClick, ...rest }: Props) {
  const handleClick = (mouseEvent: MouseEvent<HTMLAnchorElement>) => {
    track(event, eventProps)
    onClick?.(mouseEvent)
  }
  if (external) {
    return (
      <a
        href={String(rest.href)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={rest.className}
      >
        {children}
      </a>
    )
  }
  return (
    <Link {...rest} onClick={handleClick}>
      {children}
    </Link>
  )
}
