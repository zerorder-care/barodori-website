import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { LabArticleCard as LabArticleCardModel } from '@/lib/content/labArticle'
import { LabArticleCard } from './LabArticleCard'

const card: LabArticleCardModel = {
  id: '11111111-1111-4111-8111-111111111111',
  revisionId: '11111111-2222-4222-8222-222222222222',
  category: 'exercise-guide',
  kind: 'exercise_guide',
  title: '도리도리 운동 따라 하기',
  subtitle: '하루 세 번 3분이면 충분해요',
  excerpt: '아기가 편안할 때 하루 세 번 목을 부드럽게 돌려 주는 방법이에요.',
  heroImage: 'https://api.test/asset.png',
  track: 'both',
  monthMin: null,
  monthMax: null,
  publishedAt: '2026-09-11T02:00:00Z',
  readingMinutes: 4,
  locale: 'ko',
}

describe('LabArticleCard', () => {
  it('links to the detail page by content id', () => {
    render(<LabArticleCard card={card} readingTimeLabel="{minutes}분 읽기" />)
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/ko/articles/11111111-1111-4111-8111-111111111111',
    )
  })

  it('shows the category badge, the main title and the excerpt', () => {
    render(<LabArticleCard card={card} readingTimeLabel="{minutes}분 읽기" />)
    expect(screen.getByText('운동 가이드')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '도리도리 운동 따라 하기' })).toBeInTheDocument()
    expect(screen.getByText(card.excerpt)).toBeInTheDocument()
  })

  it('joins the date and the reading time with a comma and no middle dot', () => {
    render(<LabArticleCard card={card} readingTimeLabel="{minutes}분 읽기" />)
    const meta = screen.getByText('2026-09-11, 4분 읽기')
    expect(meta).toBeInTheDocument()
    expect(meta.textContent).not.toContain('·')
  })

  it('renders no empty paragraph when the excerpt is empty', () => {
    const { container } = render(
      <LabArticleCard card={{ ...card, excerpt: '' }} readingTimeLabel="{minutes}분 읽기" />,
    )
    const paragraphs = Array.from(container.querySelectorAll('p')).map((paragraph) => paragraph.textContent)
    expect(paragraphs).not.toContain('')
    expect(paragraphs).toEqual(['2026-09-11, 4분 읽기'])
  })

  it('renders a tinted placeholder instead of an image when there is no hero image', () => {
    const { container } = render(
      <LabArticleCard card={{ ...card, heroImage: null }} readingTimeLabel="{minutes}분 읽기" />,
    )
    expect(container.querySelector('img')).toBeNull()
  })
})
