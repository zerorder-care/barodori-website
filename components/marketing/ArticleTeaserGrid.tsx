import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { listArticles } from '@/lib/content/articles'
import { Badge } from '@/components/ui/Badge'
import { categoryLabels } from '@/lib/content/categories'
import type { Locale } from '@/lib/i18n/config'

export async function ArticleTeaserGrid({ locale }: { locale: Locale }) {
  const articles = (await listArticles({ locale })).slice(0, 3)
  if (articles.length === 0) return null
  return (
    <section className="bg-[var(--color-bg-muted)] py-16">
      <Container>
        <h2 className="text-center text-2xl font-bold sm:text-3xl">최신 사경 아티클</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/${locale}/articles/${a.slug}`}
              className="block overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[16/9] bg-[var(--color-bg-muted)]">
                <Image
                  src={a.heroImage}
                  alt={a.heroImageAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
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
            전체 아티클 보기 →
          </Link>
        </div>
      </Container>
    </section>
  )
}
