import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import koMessages from '@/messages/ko.json'
import { HeroV2 } from './HeroV2'

describe('HeroV2', () => {
  const copy = koMessages.home.hero

  it('renders the headline with the accent word', () => {
    render(<HeroV2 locale="ko" copy={copy} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('우리 아이 맞춤 홈케어, 오늘부터 바로도리')
  })

  it('links the primary CTA to install and the secondary CTA to head-test', () => {
    render(<HeroV2 locale="ko" copy={copy} />)
    expect(screen.getByRole('link', { name: '앱 다운로드' })).toHaveAttribute('href', '/ko/install')
    expect(screen.getByRole('link', { name: '두상 테스트 먼저 해보기' })).toHaveAttribute('href', '/ko/head-test')
  })

  it('shows three phone screens and two decorative illustrations', () => {
    render(<HeroV2 locale="ko" copy={copy} />)
    expect(screen.getByAltText(copy.screens.home)).toBeInTheDocument()
    expect(screen.getByAltText(copy.screens.weekly)).toBeInTheDocument()
    expect(screen.getByAltText(copy.screens.headReport)).toBeInTheDocument()
    expect(screen.getAllByRole('presentation')).toHaveLength(2)
  })
})
