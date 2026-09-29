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

  it('stays visible when it is already inside the viewport at mount', () => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
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
        <p>첫 화면</p>
      </Reveal>,
    )
    expect(container.firstChild).toHaveAttribute('data-visible', 'true')
  })

  it('hides a below-the-fold element until it scrolls into view', () => {
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
    const spy = vi
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue({ top: 5000, bottom: 5200 } as DOMRect)
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
    spy.mockRestore()
  })
})
