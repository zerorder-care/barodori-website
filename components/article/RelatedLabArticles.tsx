import { LabArticleCard } from '@/components/article/LabArticleCard'
import type { LabArticleCard as LabArticleCardModel } from '@/lib/content/labArticle'

export function RelatedLabArticles({
  cards,
  title,
  readingTimeLabel,
}: {
  cards: LabArticleCardModel[]
  title: string
  readingTimeLabel: string
}) {
  if (cards.length === 0) return null

  return (
    <section className="mt-12 border-t border-[var(--color-border)] pt-8">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <LabArticleCard key={card.id} card={card} readingTimeLabel={readingTimeLabel} />
        ))}
      </div>
    </section>
  )
}
