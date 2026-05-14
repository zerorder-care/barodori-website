'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { Container } from '@/components/ui/Container'

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Container className="py-20 text-center">
      <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[var(--color-primary-light)] text-3xl font-bold text-[var(--color-primary-dark)]">
        !
      </div>
      <h1 className="mt-8 text-3xl font-bold">일시적인 오류가 발생했어요</h1>
      <p className="mx-auto mt-3 max-w-md text-[var(--color-text-secondary)]">
        잠시 후 다시 시도해주세요. 문제가 계속될 경우 고객센터로 문의해주세요.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={unstable_retry}
          className="rounded-pill bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white"
        >
          다시 시도
        </button>
        <Link href="/ko" className="rounded-pill border border-[var(--color-border)] px-6 py-3 text-sm font-bold">
          홈으로 가기
        </Link>
      </div>
    </Container>
  )
}
