import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import koMessages from '@/messages/ko.json'
import { FeatureSections } from './FeatureSections'

describe('FeatureSections', () => {
  const features = koMessages.home.features

  it('renders the four section titles in order', () => {
    render(<FeatureSections locale="ko" features={features} />)
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings).toEqual(features.map((f) => f.title))
  })

  it('renders every screen with its alt text', () => {
    render(<FeatureSections locale="ko" features={features} />)
    for (const feature of features) {
      expect(screen.getByAltText(feature.screenAlt)).toBeInTheDocument()
    }
  })

  it('links only the head report section to the head test', () => {
    render(<FeatureSections locale="ko" features={features} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/ko/head-test')
    expect(links[0]).toHaveTextContent('앱 설치 전에 두상 유형부터 확인해보기')
  })

  it('renders the note where the copy has one', () => {
    render(<FeatureSections locale="ko" features={features} />)
    expect(screen.getByText(features[0].note)).toBeInTheDocument()
    expect(screen.getByText(features[2].note)).toBeInTheDocument()
  })
})
