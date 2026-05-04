import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-[--color-primary] text-black hover:bg-[--color-primary-dark]',
  secondary: 'bg-[--color-bg-muted] text-[--color-text-primary] hover:bg-[--color-border]',
  ghost: 'bg-transparent text-[--color-text-primary] hover:bg-[--color-bg-muted]',
}

export function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-pill px-6 py-3 text-sm font-semibold disabled:opacity-50 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
