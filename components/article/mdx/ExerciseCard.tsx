import type { ReactNode } from 'react'

type Props = {
  title: string
  duration?: string
  cautions?: ReactNode
  children?: ReactNode
}

export function ExerciseCard({ title, duration, cautions, children }: Props) {
  return (
    <section className="my-6 rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm">
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="m-0 text-lg font-semibold">{title}</h3>
        {duration && (
          <span className="text-sm text-[var(--color-text-secondary)]">{duration}</span>
        )}
      </header>
      {children && <div className="mt-3 text-sm leading-relaxed">{children}</div>}
      {cautions && (
        <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-[var(--color-text-primary)]">
          ⚠ {cautions}
        </p>
      )}
    </section>
  )
}
