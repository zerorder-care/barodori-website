import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Container } from '@/components/ui/Container'
import { CategoryFilter } from '@/components/article/CategoryFilter'
import { ArticleCard } from '@/components/article/ArticleCard'
import { InstallCta } from '@/components/marketing/InstallCta'
import { listArticles } from '@/lib/content/articles'
import { isCategory, type Category } from '@/lib/content/categories'
import type { Locale } from '@/lib/i18n/config'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return buildMetadata({
    title: '사경 아티클 - 바로도리',
    description: '영아 사경, 두상 비대칭, 가정 운동, 월령별 관리 정보',
    path: `/${locale}/articles`,
    locale,
  })
}

export default async function ArticlesIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ cat?: string; q?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  const category: Category | undefined = sp.cat && isCategory(sp.cat) ? sp.cat : undefined
  const query = typeof sp.q === 'string' ? sp.q.trim() : ''
  const allArticles = await listArticles({ locale: loc })
  const recommended = allArticles.slice(0, 3)
  const articles = (category ? allArticles.filter((a) => a.category === category) : allArticles).filter((article) => {
    if (!query) return true
    return `${article.title} ${article.excerpt}`.toLowerCase().includes(query.toLowerCase())
  })

  return (
    <>
      <section className="bg-[var(--color-bg-muted)] py-20">
        <Container className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
            아티클
          </p>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">사경·사두에 대한 다양한 정보</h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
            핵심 정보부터 가정 운동, 월령별 관리까지 보호자에게 필요한 글을 모았습니다.
          </p>
        </Container>
      </section>

      <Container className="py-16">
        <div className="flex flex-col gap-4 border-y border-[var(--color-border)] py-5 lg:flex-row lg:items-center lg:justify-between">
          <CategoryFilter locale={loc} />
          <form
            action={`/${loc}/articles`}
            className="flex min-h-12 min-w-0 items-center rounded-[8px] border border-[var(--color-border)] bg-white px-4 lg:w-72"
          >
            {category && <input type="hidden" name="cat" value={category} />}
            <span className="mr-3 text-sm font-semibold text-[var(--color-text-secondary)]">검색</span>
            <input
              name="q"
              defaultValue={query}
              placeholder="아티클 검색"
              className="w-full bg-transparent text-sm outline-none"
            />
          </form>
        </div>

        {recommended.length > 0 && (
          <section className="mt-12">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold text-[var(--color-text-secondary)]">필독 가이드</p>
                <h2 className="mt-2 text-2xl font-bold">꼭 읽어보세요</h2>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">처음 방문한 보호자를 위한 추천 콘텐츠</p>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {recommended.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-16">
          <h2 className="text-2xl font-bold">전체 아티클</h2>
          {articles.length === 0 ? (
            <p className="mt-8 rounded-[8px] border border-[var(--color-border)] p-8 text-center text-[var(--color-text-secondary)]">
              {query ? `'${query}'에 대한 결과가 없어요.` : '아직 등록된 아티클이 없어요.'}
            </p>
          ) : (
            <>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[var(--color-text-primary)] px-6 text-sm font-bold"
                >
                  더보기 +
                </button>
              </div>
            </>
          )}
        </section>
      </Container>

      <InstallCta locale={loc} surface="articles_footer" />
    </>
  )
}
