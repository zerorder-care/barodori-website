import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import koMessages from '@/messages/ko.json'
import enMessages from '@/messages/en.json'
import { PricingSection } from './PricingSection'

describe('PricingSection', () => {
  it('renders the confirmed Korean prices as given in the dictionary', () => {
    render(<PricingSection locale="ko" copy={koMessages.home.pricing} />)
    expect(screen.getByText('월 2,875원')).toBeInTheDocument()
    expect(screen.getByText('연 34,500원')).toBeInTheDocument()
    expect(screen.getByText('51% OFF')).toBeInTheDocument()
    expect(screen.getAllByText('월 5,900원')).toHaveLength(2)
  })

  it('offers only the app download link, never a subscribe button', () => {
    render(<PricingSection locale="ko" copy={koMessages.home.pricing} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/ko/install')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('hides price cards when the dictionary has no amounts', () => {
    render(<PricingSection locale="en" copy={enMessages.home.pricing} />)
    expect(screen.queryByText('51% OFF')).toBeNull()
    expect(screen.getByText(enMessages.home.pricing.title)).toBeInTheDocument()
  })
})
