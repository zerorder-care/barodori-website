import Link from 'next/link'
import { monthLabel, type LabArticleCard as LabArticleCardModel, type MonthLabels } from '@/lib/content/labArticle'

export type MonthlyTrackLabels = MonthLabels & {
  trackTorticollis: string
  trackHeadShape: string
}

type Group = {
  key: 'torticollis' | 'head_shape'
  title: string
  cards: LabArticleCardModel[]
}

function sortByMonth(cards: LabArticleCardModel[]): LabArticleCardModel[] {
  return [...cards].sort((a, b) => {
    const left = a.monthMin ?? Number.MAX_SAFE_INTEGER
    const right = b.monthMin ?? Number.MAX_SAFE_INTEGER
    if (left !== right) return left - right
    return a.title.localeCompare(b.title)
  })
}

export function MonthlyTrackList({
  cards,
  labels,
}: {
  cards: LabArticleCardModel[]
  labels: MonthlyTrackLabels
}) {
  if (cards.length === 0) return null

  // 배열 리터럴을 먼저 Group[]로 좁혀 두어야 key가 문자열로 넓어지지 않는다.
  const allGroups: Group[] = [
    {
      key: 'torticollis',
      title: labels.trackTorticollis,
      cards: sortByMonth(cards.filter((card) => card.track === 'torticollis' || card.track === 'both')),
    },
    {
      key: 'head_shape',
      title: labels.trackHeadShape,
      cards: sortByMonth(cards.filter((card) => card.track === 'head_shape' || card.track === 'both')),
    },
  ]
  const groups = allGroups.filter((group) => group.cards.length > 0)

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.key}>
          <h3 className="text-lg font-bold">{group.title}</h3>
          <ul className="mt-4 divide-y divide-[var(--color-border)] rounded-[8px] border border-[var(--color-border)] bg-white">
            {group.cards.map((card) => {
              const month = monthLabel(labels, card.monthMin, card.monthMax)
              return (
                <li key={`${group.key}-${card.id}`}>
                  <Link
                    href={`/${card.locale}/articles/${card.id}`}
                    className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-4"
                  >
                    {month && (
                      <span className="shrink-0 rounded-pill bg-[var(--color-bg-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                        {month}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{card.title}</span>
                      {card.subtitle && (
                        <span className="mt-0.5 block truncate text-sm text-[var(--color-text-secondary)]">
                          {card.subtitle}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
