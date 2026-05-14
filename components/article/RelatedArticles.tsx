import { ArticleCard } from './ArticleCard'
import type { Article } from '@/lib/content/articles'

export function RelatedArticles({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null
  return (
    <section className="mt-12 border-t border-[var(--color-border)] pt-8">
      <h2 className="text-xl font-bold">관련 아티클</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </section>
  )
}
