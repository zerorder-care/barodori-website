import type { ReactNode } from 'react'

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1056px] px-5 sm:px-6 ${className}`}>{children}</div>
}
