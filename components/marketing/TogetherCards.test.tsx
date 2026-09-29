import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import koMessages from '@/messages/ko.json'
import { TogetherCards } from './TogetherCards'

describe('TogetherCards', () => {
  const copy = koMessages.home.together

  it('renders the section title and both cards', () => {
    render(<TogetherCards copy={copy} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(copy.title)
    for (const card of copy.cards) {
      expect(screen.getByRole('heading', { level: 3, name: card.title })).toBeInTheDocument()
      expect(screen.getByText(card.body)).toBeInTheDocument()
    }
  })

  it('has no links', () => {
    render(<TogetherCards copy={copy} />)
    expect(screen.queryByRole('link')).toBeNull()
  })
})
