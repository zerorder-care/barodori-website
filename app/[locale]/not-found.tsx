import Link from 'next/link'
import { Container } from '@/components/ui/Container'

export default function NotFound() {
  return (
    <Container className="py-20 text-center">
      <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[var(--color-primary-light)] text-4xl font-bold text-[var(--color-primary-dark)]">
        ?
      </div>
      <h1 className="mt-8 text-3xl font-bold">찾으시는 페이지를 찾을 수 없어요</h1>
      <p className="mx-auto mt-3 max-w-md text-[var(--color-text-secondary)]">
        주소가 잘못 입력되었거나 페이지가 이동되었을 수 있어요.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/ko" className="rounded-pill bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white">
          홈으로 가기
        </Link>
        <Link href="/ko/faq" className="rounded-pill border border-[var(--color-border)] px-6 py-3 text-sm font-bold">
          자주 묻는 질문
        </Link>
      </div>
    </Container>
  )
}
