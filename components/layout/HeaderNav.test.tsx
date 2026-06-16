import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HeaderNav } from './HeaderNav'

vi.mock('next/navigation', () => ({
  usePathname: () => '/ko',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

const labels = {
  home: '홈',
  reviews: '후기',
  community: '커뮤니티',
  articles: '바로도리 컨텐츠',
  newsroom: '소식',
  faq: '자주 묻는 질문',
  login: '로그인',
  logout: '로그아웃',
  mypage: '마이페이지',
  install: '앱 시작하기',
  start: '시작하기',
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ authenticated: false }) })),
  )
})

describe('HeaderNav', () => {
  it('logged out: shows a "시작하기" action linking to /login', async () => {
    render(<HeaderNav locale="ko" appName="바로도리" labels={labels} />)
    const cta = await screen.findByRole('link', { name: '시작하기' })
    expect(cta).toHaveAttribute('href', '/ko/login')
  })

  it('does not render the outdated launch CTA or dead status label', async () => {
    render(<HeaderNav locale="ko" appName="바로도리" labels={labels} />)
    await screen.findByRole('link', { name: '바로도리 컨텐츠' })
    expect(screen.queryByRole('link', { name: '기능 소개' })).toBeNull()
    expect(screen.queryByText('오픈 소식 받기')).toBeNull()
    expect(screen.queryByText('홈케어 운동 기록 앱')).toBeNull()
  })

  it('renders the primary nav items', async () => {
    render(<HeaderNav locale="ko" appName="바로도리" labels={labels} />)
    expect(await screen.findByRole('link', { name: '바로도리 컨텐츠' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '자주 묻는 질문' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '커뮤니티' })).toBeNull()
    expect(screen.queryByRole('link', { name: '소식' })).toBeNull()
  })

  it('logged in: shows 마이페이지 and 로그아웃, not 시작하기', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ authenticated: true }) })),
    )
    render(<HeaderNav locale="ko" appName="바로도리" labels={labels} />)
    expect(await screen.findByRole('link', { name: '마이페이지' })).toHaveAttribute('href', '/ko/mypage')
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '시작하기' })).toBeNull()
  })
})
