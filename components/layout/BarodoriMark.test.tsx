import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BarodoriMark } from './BarodoriMark'

describe('BarodoriMark', () => {
  it('renders the brand image and forwards className', () => {
    const { container } = render(<BarodoriMark className="h-7 w-7" />)
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img).toHaveClass('h-7', 'w-7')
  })
})
