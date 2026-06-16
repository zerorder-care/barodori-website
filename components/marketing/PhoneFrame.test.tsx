import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PhoneFrame } from './PhoneFrame'

describe('PhoneFrame', () => {
  it('renders the screenshot with its alt text', () => {
    render(<PhoneFrame src="/images/app-screens/home.png" alt="홈 화면 미리보기" />)
    expect(screen.getByAltText('홈 화면 미리보기')).toBeInTheDocument()
  })

  it('shows the bottom fade overlay only when tall', () => {
    const { queryByTestId, rerender } = render(<PhoneFrame src="/x.png" alt="a" />)
    expect(queryByTestId('screen-fade')).toBeNull()

    rerender(<PhoneFrame src="/x.png" alt="a" tall />)
    expect(queryByTestId('screen-fade')).not.toBeNull()
  })
})
