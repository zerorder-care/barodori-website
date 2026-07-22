import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import koMessages from '@/messages/ko.json'
import { HomeStorySections } from './HomeStorySections'

describe('HomeStorySections', () => {
  it('renders all six section titles', () => {
    render(<HomeStorySections sections={koMessages.home.storySections} />)
    for (const section of koMessages.home.storySections) {
      expect(screen.getByText(section.title.split('\n')[0])).toBeInTheDocument()
    }
  })

  it('renders each app screenshot via alt text', () => {
    render(<HomeStorySections sections={koMessages.home.storySections} />)
    expect(screen.getAllByRole('img')).toHaveLength(6)
    expect(screen.getByAltText(/홈 화면/)).toBeInTheDocument()
    expect(screen.getByAltText(/커뮤니티/)).toBeInTheDocument()
    expect(screen.getByAltText(/보호자 컨디션 셀프 체크/)).toBeInTheDocument()
  })

  it('contains no links (community is showcase-only, no CTAs anywhere)', () => {
    render(<HomeStorySections sections={koMessages.home.storySections} />)
    expect(screen.queryByRole('link')).toBeNull()
  })
})
