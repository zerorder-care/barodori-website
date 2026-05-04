'use client'

import Link, { type LinkProps } from 'next/link'
import { type ReactNode } from 'react'
import { track } from '@/lib/analytics'

type Props = LinkProps & {
  event: string
  eventProps?: Record<string, unknown>
  className?: string
  children: ReactNode
  external?: boolean
}

export function TrackedLink({ event, eventProps, external, children, ...rest }: Props) {
  const onClick = () => track(event, eventProps)
  if (external) {
    return (
      <a
        href={String(rest.href)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={rest.className}
      >
        {children}
      </a>
    )
  }
  return (
    <Link {...rest} onClick={onClick}>
      {children}
    </Link>
  )
}
