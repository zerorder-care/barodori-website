import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BarodoriMark } from './BarodoriMark'

describe('BarodoriMark', () => {
  it('renders an svg and forwards className', () => {
    const { container } = render(<BarodoriMark className="h-7 w-7" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg).toHaveClass('h-7', 'w-7')
  })
})
