import type { ReactNode } from 'react'

export function Badge({ children, tone = 'primary' }: { children: ReactNode; tone?: 'primary' | 'neutral' }) {
  const cls =
    tone === 'primary'
      ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]'
      : 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]'
  return <span className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium ${cls}`}>{children}</span>
}
