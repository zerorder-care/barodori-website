import type { ReactNode } from 'react'

export function Badge({ children, tone = 'primary' }: { children: ReactNode; tone?: 'primary' | 'neutral' }) {
  const cls =
    tone === 'primary'
      ? 'bg-[--color-primary-light] text-[--color-primary-dark]'
      : 'bg-[--color-bg-muted] text-[--color-text-secondary]'
  return <span className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium ${cls}`}>{children}</span>
}
