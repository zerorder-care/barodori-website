import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SectionHeading } from './SectionHeading'

describe('SectionHeading', () => {
  it('renders the label and an h2 carrying the given id', () => {
    render(<SectionHeading id="demo-title" label="이용 요금" title="3일은 무료로" />)
    const heading = screen.getByRole('heading', { level: 2, name: '3일은 무료로' })
    expect(heading).toHaveAttribute('id', 'demo-title')
    expect(screen.getByText('이용 요금')).toBeInTheDocument()
  })
})
