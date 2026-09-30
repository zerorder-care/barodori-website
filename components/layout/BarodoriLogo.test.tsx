import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BarodoriLogo } from './BarodoriLogo'

describe('BarodoriLogo', () => {
  it('renders the Korean lockup with the brand name as alt', () => {
    render(<BarodoriLogo locale="ko" label="바로도리" />)
    const img = screen.getByAltText('바로도리')
    expect(img).toHaveAttribute('src', expect.stringContaining('logo-ko'))
  })

  it('renders the English lockup for en', () => {
    render(<BarodoriLogo locale="en" label="Barodori" />)
    expect(screen.getByAltText('Barodori')).toHaveAttribute('src', expect.stringContaining('logo-en'))
  })
})
