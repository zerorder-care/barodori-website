import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CommunityBoard } from '@/components/community/CommunityBoard'
import { Container } from '@/components/ui/Container'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import type { Locale } from '@/lib/i18n/config'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return buildMetadata({
    title: '커뮤니티 - 바로도리',
    description: '사경·사두를 겪는 보호자들의 질문, 기록, 응원을 둘러보세요.',
    path: `/${locale}/community`,
    locale,
  })
}

export default async function CommunityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale

  return (
    <>
      <section className="bg-[var(--color-bg-muted)] py-20">
        <Container className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
            커뮤니티
          </p>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">보호자들이 함께 나누는 이야기</h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
            비회원도 커뮤니티 분위기를 미리 확인할 수 있습니다. 글 작성과 댓글은 바로도리 앱에서 가능합니다.
          </p>
        </Container>
      </section>

      <Container className="py-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">커뮤니티 게시글</h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">소통방 · 질문방 · 희망일기의 최신 이야기를 둘러보세요.</p>
          </div>
          <Link
            href={`/${loc}/install`}
            className="inline-flex min-h-11 items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-5 text-sm font-bold text-white"
          >
            앱에서 글쓰기
          </Link>
        </div>
        <CommunityBoard locale={loc} />
      </Container>
    </>
  )
}
