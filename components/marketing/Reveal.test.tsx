import { render, screen } from '@testing-library/react'
import { describe, it, expect, afterEach, vi } from 'vitest'
import { Reveal } from './Reveal'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Reveal', () => {
  it('always renders its children (content is never removed from the DOM)', () => {
    render(
      <Reveal>
        <p>보이는 내용</p>
      </Reveal>,
    )
    expect(screen.getByText('보이는 내용')).toBeInTheDocument()
  })

  it('falls back to visible when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const { container } = render(
      <Reveal>
        <p>폴백</p>
      </Reveal>,
    )
    expect(container.firstChild).toHaveAttribute('data-visible', 'true')
  })
})
