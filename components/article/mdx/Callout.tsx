import type { ReactNode } from 'react'

type Props = {
  type?: 'info' | 'warning' | 'medical'
  children: ReactNode
}

const styles: Record<NonNullable<Props['type']>, string> = {
  info: 'border-l-4 border-[--color-primary] bg-[--color-primary-light] text-[--color-text-primary]',
  warning: 'border-l-4 border-[--color-warning] bg-amber-50 text-[--color-text-primary]',
  medical: 'border-l-4 border-[--color-danger] bg-red-50 text-[--color-text-primary]',
}

export function Callout({ type = 'info', children }: Props) {
  return (
    <aside className={`my-6 rounded-md p-4 ${styles[type]}`} role="note">
      {children}
    </aside>
  )
}
