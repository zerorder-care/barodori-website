import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import koMessages from '@/messages/ko.json'
import { HeadTestFlow } from './HeadTestFlow'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

const trackSpy = vi.fn()

vi.mock('@/lib/analytics', () => ({
  track: (event: string, props?: Record<string, unknown>) => trackSpy(event, props),
}))

const copy = koMessages.headTest

function renderFlow() {
  return render(<HeadTestFlow locale="ko" copy={copy} homeLabel="홈" />)
}

function answer(label: string) {
  fireEvent.click(screen.getByRole('button', { name: label }))
}

beforeEach(() => {
  vi.useFakeTimers()
  push.mockClear()
  trackSpy.mockClear()
  window.sessionStorage.clear()
  window.matchMedia = vi.fn().mockReturnValue({ matches: false })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('HeadTestFlow', () => {
  it('카메라를 쓸 수 없으면 갤러리·문항 출구를 보여준다', async () => {
    vi.useRealTimers()
    renderFlow()
    answer(copy.intro.photoCta)
    expect(await screen.findByText(copy.photo.permissionTitle)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: copy.photo.galleryLabel })).toBeInTheDocument()
    answer(copy.photo.useQuestions)
    expect(screen.getByRole('heading', { name: copy.questions[0].text })).toBeInTheDocument()
  })

  it('인트로에서 문항 시작 버튼을 누르면 첫 문항이 보인다', () => {
    renderFlow()
    expect(screen.getByRole('heading', { name: copy.intro.title })).toBeInTheDocument()
    answer(copy.intro.questionCta)
    expect(screen.getByRole('heading', { name: copy.questions[0].text })).toBeInTheDocument()
  })

  it('선택 즉시 다음 문항으로 자동 진행하고 진행바가 갱신된다', () => {
    renderFlow()
    answer(copy.intro.questionCta)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1')
    answer('동그란 편')
    expect(screen.getByRole('heading', { name: copy.questions[1].text })).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')
  })

  it('뒤로 가기는 이전 문항으로, 첫 문항에서는 인트로로 돌아간다', () => {
    renderFlow()
    answer(copy.intro.questionCta)
    answer('동그란 편')
    fireEvent.click(screen.getByRole('button', { name: copy.flow.backLabel }))
    expect(screen.getByRole('heading', { name: copy.questions[0].text })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /동그란 편/ })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: copy.flow.backLabel }))
    expect(screen.getByRole('heading', { name: copy.intro.title })).toBeInTheDocument()
  })

  it('마지막 응답 후 판정 전환 화면을 거쳐 결과로 이동하고 개인화 값을 저장한다', () => {
    renderFlow()
    answer(copy.intro.questionCta)
    answer('앞뒤로 길쭉한 편')
    answer('완만하게 둥근 편')
    answer('비슷해 보여요')
    answer('왼쪽')
    answer('안겨 있거나 엎드리는 시간도 꽤 있어요')
    answer('아직 안 해봤어요')
    answer('아직 3개월이 안 됐어요')

    expect(screen.getByText(copy.flow.judging)).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1200)
    expect(push).toHaveBeenCalledWith('/ko/head-test/result/ppyojogi')
    expect(window.sessionStorage.getItem('headTest.preferredSide')).toBe('left')
    expect(window.sessionStorage.getItem('headTest.ageBand')).toBe('under3m')
    expect(window.sessionStorage.getItem('headTest.tummyReaction')).toBe('notYet')
  })

  it('퍼널 이벤트를 스펙 스키마대로 남기고 완료 유형을 기록한다', () => {
    renderFlow()
    expect(trackSpy).toHaveBeenCalledWith('head_test_view', { locale: 'ko', source: 'direct' })

    answer(copy.intro.questionCta)
    expect(trackSpy).toHaveBeenCalledWith('head_test_start', { locale: 'ko', path: 'questions' })

    answer('앞뒤로 길쭉한 편')
    answer('완만하게 둥근 편')
    answer('비슷해 보여요')
    answer('양쪽 골고루')
    answer('잘 모르겠어요')
    answer('아직 안 해봤어요')
    answer('3개월이 지났어요')

    expect(trackSpy).toHaveBeenCalledWith('head_test_complete', {
      locale: 'ko',
      type: 'ppyojogi',
      path: 'questions',
    })
    expect(window.sessionStorage.getItem('headTest.completedType')).toBe('ppyojogi')
  })
})
