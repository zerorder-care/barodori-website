import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import type { LabArticleCard as LabArticleCardModel } from '@/lib/content/labArticle'
import { MonthlyTrackList } from './MonthlyTrackList'

const labels = {
  trackTorticollis: '근성 및 자세성 사경',
  trackHeadShape: '단순 두상',
  monthRange: '{min}개월',
  monthRangeSpan: '{min}개월부터 {max}개월',
  monthPlus: '13개월 이상',
}

function card(overrides: Partial<LabArticleCardModel>): LabArticleCardModel {
  return {
    id: 'id-1',
    revisionId: 'rev-1',
    category: 'monthly',
    kind: 'disease_info',
    title: '제목',
    subtitle: null,
    excerpt: '요약',
    heroImage: null,
    track: 'torticollis',
    monthMin: 1,
    monthMax: 1,
    publishedAt: '2026-08-01T00:00:00Z',
    readingMinutes: 1,
    locale: 'ko',
    ...overrides,
  }
}

describe('MonthlyTrackList', () => {
  it('renders only the groups that have articles', () => {
    render(<MonthlyTrackList cards={[card({})]} labels={labels} />)
    const headings = screen.getAllByRole('heading').map((heading) => heading.textContent)
    expect(headings).toEqual(['근성 및 자세성 사경'])
  })

  it('puts the torticollis group before the head shape group', () => {
    render(<MonthlyTrackList cards={[card({ id: 'both-1', track: 'both', title: '공통 글' })]} labels={labels} />)
    const headings = screen.getAllByRole('heading').map((heading) => heading.textContent)
    expect(headings).toEqual(['근성 및 자세성 사경', '단순 두상'])
  })

  it('shows an article targeting both tracks in both groups', () => {
    render(<MonthlyTrackList cards={[card({ id: 'both-1', track: 'both', title: '공통 글' })]} labels={labels} />)
    expect(screen.getAllByText('공통 글')).toHaveLength(2)
  })

  it('sorts rows by the starting month', () => {
    render(
      <MonthlyTrackList
        cards={[
          card({ id: 'a', title: '넷째 달', monthMin: 4, monthMax: 4 }),
          card({ id: 'b', title: '첫째 달', monthMin: 1, monthMax: 1 }),
        ]}
        labels={labels}
      />,
    )
    const rows = screen.getAllByRole('listitem')
    expect(within(rows[0]).getByText('첫째 달')).toBeInTheDocument()
    expect(within(rows[1]).getByText('넷째 달')).toBeInTheDocument()
  })

  it('labels an open ended month range as thirteen months and older', () => {
    render(<MonthlyTrackList cards={[card({ monthMin: 13, monthMax: null })]} labels={labels} />)
    expect(screen.getByText('13개월 이상')).toBeInTheDocument()
  })

  it('labels a month span', () => {
    render(<MonthlyTrackList cards={[card({ monthMin: 4, monthMax: 6 })]} labels={labels} />)
    expect(screen.getByText('4개월부터 6개월')).toBeInTheDocument()
  })

  it('shows the subtitle next to the title', () => {
    render(<MonthlyTrackList cards={[card({ title: '본제목', subtitle: '부제목' })]} labels={labels} />)
    expect(screen.getByText('부제목')).toBeInTheDocument()
  })

  it('renders nothing when there are no cards', () => {
    const { container } = render(<MonthlyTrackList cards={[]} labels={labels} />)
    expect(container).toBeEmptyDOMElement()
  })
})
