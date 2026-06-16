import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HomeStorySections } from './HomeStorySections'

describe('HomeStorySections', () => {
  it('renders all six section titles', () => {
    render(<HomeStorySections />)
    expect(screen.getByText('앱을 열면, 오늘 뭘 할지 바로 보여요')).toBeInTheDocument()
    expect(screen.getByText('동요 틀고, 도리랑 같이 운동해요')).toBeInTheDocument()
    expect(screen.getByText('방금 한 운동이, 좌우 횟수까지 그대로 남아요')).toBeInTheDocument()
    expect(screen.getByText('쌓인 기록이, 이번 주 흐름을 보여줘요')).toBeInTheDocument()
    expect(screen.getByText('혼자가 아니라는 걸, 여기서 느껴요')).toBeInTheDocument()
    expect(screen.getByText('아이를 돌본 만큼, 보호자님도 살펴요')).toBeInTheDocument()
  })

  it('renders each app screenshot via alt text', () => {
    render(<HomeStorySections />)
    expect(screen.getAllByRole('img')).toHaveLength(6)
    expect(screen.getByAltText(/홈 화면/)).toBeInTheDocument()
    expect(screen.getByAltText(/커뮤니티/)).toBeInTheDocument()
    expect(screen.getByAltText(/보호자 컨디션 셀프 체크/)).toBeInTheDocument()
  })

  it('contains no links (community is showcase-only, no CTAs anywhere)', () => {
    render(<HomeStorySections />)
    expect(screen.queryByRole('link')).toBeNull()
  })
})
