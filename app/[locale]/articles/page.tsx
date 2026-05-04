import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Container } from '@/components/ui/Container'
import { CategoryFilter } from '@/components/article/CategoryFilter'
import { ArticleCard } from '@/components/article/ArticleCard'
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
  searchParams: Promise<{ cat?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  const category: Category | undefined = sp.cat && isCategory(sp.cat) ? sp.cat : undefined
  const articles = await listArticles({ locale: loc, category })

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold">사경 아티클</h1>
      <p className="mt-2 text-[--color-text-secondary]">바로도리 사용자가 자주 묻는 정보를 모았어요.</p>
      <div className="mt-6">
        <CategoryFilter locale={loc} />
      </div>
      {articles.length === 0 ? (
        <p className="mt-8 text-center text-[--color-text-secondary]">아직 등록된 아티클이 없어요.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      )}
    </Container>
  )
}
