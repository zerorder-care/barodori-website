import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { listArticlePosts } from '@/lib/api/articles'
import { Badge } from '@/components/ui/Badge'
import { categoryLabels } from '@/lib/content/categories'
import type { Locale } from '@/lib/i18n/config'

export async function ArticleTeaserGrid({ locale }: { locale: Locale }) {
  const { articles } = await listArticlePosts({ locale, limit: 3 })
  if (articles.length === 0) return null
  return (
    <section className="bg-[var(--color-bg-muted)] py-16">
      <Container>
        <div className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
            바로도리 컨텐츠
          </p>
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">아기 사경·터미타임이 걱정될 때 참고할 바로도리 컨텐츠</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
            목 관찰, 두상 비대칭, 터미타임처럼 보호자가 상담 전 정리해두면 좋은 기록 팁을 모았어요.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/${locale}/articles/${a.slug}`}
              className="block overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[16/9] bg-[var(--color-bg-muted)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.heroImage}
                  alt={a.heroImageAlt}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <Badge>{categoryLabels[a.category][locale]}</Badge>
                <h3 className="mt-2 text-base font-semibold">{a.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{a.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href={`/${locale}/articles`} className="text-sm font-semibold text-[var(--color-primary-dark)] underline">
            컨텐츠 더 보기 →
          </Link>
        </div>
      </Container>
    </section>
  )
}
