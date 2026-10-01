import type { ReactNode } from 'react'

export function LabCallout({ icon, children }: { icon: string | null; children: ReactNode }) {
  return (
    <aside
      role="note"
      className="my-6 flex gap-3 rounded-md border-l-4 border-[var(--color-primary)] bg-[var(--color-primary-light)] p-4 text-[var(--color-text-primary)]"
    >
      {icon && (
        <span aria-hidden="true" className="shrink-0 text-lg leading-7">
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1 [&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div>
    </aside>
  )
}
