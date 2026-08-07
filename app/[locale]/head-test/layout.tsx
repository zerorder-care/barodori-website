import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'

// 테스트 화면은 사이트 공통 헤더·푸터 없이 모바일 폭 중앙 컬럼을 쓴다 (UX 스펙 §1·§2).
export default async function HeadTestLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <main className="flex flex-1 justify-center bg-[var(--color-primary-light)]">
      <div className="flex min-h-full w-full max-w-[480px] flex-col bg-[var(--color-bg)] sm:border-x sm:border-[var(--color-border)]">
        {children}
      </div>
    </main>
  )
}
