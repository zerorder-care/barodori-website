import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { FaqAccordion, type FaqItem } from './FaqAccordion'

const labels = {
  searchLabel: '검색',
  searchPlaceholder: '질문을 검색하세요',
  loadError: 'FAQ 데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
  empty: '등록된 질문이 없어요.',
  emptyWithQuery: "'{query}'에 대한 결과가 없어요.",
  readMore: '자세히 읽기',
}

const items: FaqItem[] = [
  {
    id: '22222222-1111-4111-8111-111111111111',
    question: '사경 운동은 언제까지 해야 하나요?',
    answer: '담당 전문의가 정한 기간을 따릅니다.',
    href: '/ko/articles/22222222-1111-4111-8111-111111111111',
  },
  {
    id: '22222222-1111-4111-8111-222222222222',
    question: '터미타임은 하루 몇 분이 좋나요?',
    answer: '아이가 힘들어하지 않는 범위에서 나누어 합니다.',
    href: '/ko/articles/22222222-1111-4111-8111-222222222222',
  },
]

describe('FaqAccordion', () => {
  it('renders every question with its answer', () => {
    render(<FaqAccordion locale="ko" items={items} query="" labels={labels} />)
    expect(screen.getByText('사경 운동은 언제까지 해야 하나요?')).toBeInTheDocument()
    expect(screen.getByText('아이가 힘들어하지 않는 범위에서 나누어 합니다.')).toBeInTheDocument()
  })

  it('links each item to its detail page', () => {
    render(<FaqAccordion locale="ko" items={items} query="" labels={labels} />)
    const link = screen.getAllByRole('link', { name: '자세히 읽기' })[0]
    expect(link).toHaveAttribute('href', items[0].href)
  })

  it('does not render category chips', () => {
    render(<FaqAccordion locale="ko" items={items} query="" labels={labels} />)
    expect(screen.queryByText('전체')).toBeNull()
  })

  it('keeps the search form pointed at the faq page', () => {
    const { container } = render(<FaqAccordion locale="en" items={items} query="tummy" labels={labels} />)
    expect(container.querySelector('form')).toHaveAttribute('action', '/en/faq')
    expect(screen.getByRole('textbox')).toHaveValue('tummy')
  })

  it('shows the plain empty state', () => {
    render(<FaqAccordion locale="ko" items={[]} query="" labels={labels} />)
    expect(screen.getByText('등록된 질문이 없어요.')).toBeInTheDocument()
  })

  it('shows the query empty state with the query filled in', () => {
    render(<FaqAccordion locale="ko" items={[]} query="사두" labels={labels} />)
    expect(screen.getByText("'사두'에 대한 결과가 없어요.")).toBeInTheDocument()
  })

  it('shows the load error notice', () => {
    render(<FaqAccordion locale="ko" items={items} query="" error="lab_api_http_500" labels={labels} />)
    expect(screen.getByText(labels.loadError)).toBeInTheDocument()
  })

  it('opens the first item by default', () => {
    const { container } = render(<FaqAccordion locale="ko" items={items} query="" labels={labels} />)
    const details = container.querySelectorAll('details')
    expect(details[0]).toHaveAttribute('open')
    expect(within(details[0] as HTMLElement).getByText(items[0].answer)).toBeInTheDocument()
  })
})
