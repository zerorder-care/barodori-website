import { render, screen, act } from '@testing-library/react'
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

  it('becomes visible when the element scrolls into view', () => {
    let callback: IntersectionObserverCallback | undefined
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback) {
          callback = cb
        }
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return []
        }
      },
    )
    const { container } = render(
      <Reveal>
        <p>등장</p>
      </Reveal>,
    )
    expect(container.firstChild).toHaveAttribute('data-visible', 'false')
    act(() => {
      callback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
    expect(container.firstChild).toHaveAttribute('data-visible', 'true')
  })
})
