import { describe, expect, it } from 'vitest'
import koMessages from '@/messages/ko.json'
import enMessages from '@/messages/en.json'
import { questionIds, questionOptions } from './constants'
import { classifyMeasurement, scoreAnswers, type Answers } from './scoring'
import { headTypes } from './types'

describe('classifyMeasurement', () => {
  it('CVAI가 정확히 3.5이면 따옴이로 판정한다', () => {
    expect(classifyMeasurement(82, 3.5)).toBe('ttaomi')
  })

  it('CVAI는 CI보다 우선한다', () => {
    expect(classifyMeasurement(90, 4)).toBe('ttaomi')
    expect(classifyMeasurement(70, 12)).toBe('ttaomi')
  })

  it('CVAI가 3.5 미만이면 CI 기준으로 넘어간다', () => {
    expect(classifyMeasurement(90, 3.49)).toBe('banguri')
  })

  it('CI가 정확히 85이면 방울이가 아니라 동글이다', () => {
    expect(classifyMeasurement(85, 0)).toBe('donggeuri')
    expect(classifyMeasurement(85.01, 0)).toBe('banguri')
  })

  it('CI가 정확히 75이면 뾰족이가 아니라 짱구다', () => {
    expect(classifyMeasurement(75, 0)).toBe('jjanggu')
    expect(classifyMeasurement(74.99, 0)).toBe('ppyojogi')
  })

  it('CI가 정확히 80이면 짱구가 아니라 동글이다', () => {
    expect(classifyMeasurement(80, 0)).toBe('donggeuri')
    expect(classifyMeasurement(79.99, 0)).toBe('jjanggu')
  })

  it('소수점 둘째 자리로 반올림한 값으로 판정한다', () => {
    expect(classifyMeasurement(82, 3.495)).toBe('ttaomi')
    expect(classifyMeasurement(82, 3.4949)).toBe('donggeuri')
    expect(classifyMeasurement(84.996, 0)).toBe('donggeuri')
    expect(classifyMeasurement(85.004, 0)).toBe('donggeuri')
    expect(classifyMeasurement(85.005, 0)).toBe('banguri')
  })
})

const neutral: Answers = {
  shape: 'round',
  backline: 'gentle',
  ears: 'similar',
  headSide: 'both',
  lying: 'varied',
  tummy: 'notYet',
  age: 'from3m',
}

describe('scoreAnswers — 도달 가능성 (스펙 §3)', () => {
  it('따옴이는 관찰 신호 두 개가 겹쳐야 도달한다', () => {
    expect(scoreAnswers({ ...neutral, shape: 'tilted', ears: 'oneForward' }).type).toBe('ttaomi')
    expect(scoreAnswers({ ...neutral, shape: 'tilted', headSide: 'left' }).type).toBe('ttaomi')
    expect(scoreAnswers({ ...neutral, ears: 'oneForward', headSide: 'right' }).type).toBe('ttaomi')
  })

  it('고개 방향 하나만으로는 따옴이가 되지 않는다', () => {
    const result = scoreAnswers({ ...neutral, headSide: 'left' })
    expect(result.points.ttaomi).toBe(1)
    expect(result.type).toBe('donggeuri')
  })

  it('방울이는 넓적·납작·눕기 신호의 조합으로 도달한다', () => {
    expect(scoreAnswers({ ...neutral, shape: 'wide', backline: 'flat' }).type).toBe('banguri')
    expect(scoreAnswers({ ...neutral, shape: 'wide', lying: 'mostly' }).type).toBe('banguri')
    expect(scoreAnswers({ ...neutral, backline: 'flat', lying: 'mostly' }).type).toBe('banguri')
  })

  it('1번 모름 경로에서도 납작한 편과 가중된 눕기로 방울이에 도달한다', () => {
    const result = scoreAnswers({ ...neutral, shape: 'unsure', backline: 'flat', lying: 'mostly' })
    expect(result.points.banguri).toBe(4)
    expect(result.type).toBe('banguri')
  })

  it('뾰족이는 앞뒤로 길쭉한 편 하나로 도달한다', () => {
    expect(scoreAnswers({ ...neutral, shape: 'long' }).type).toBe('ppyojogi')
  })

  it('짱구는 봉긋한 라인과 엎드려 잘 버티는 반응으로 도달한다', () => {
    expect(scoreAnswers({ ...neutral, backline: 'pointy', tummy: 'enjoys' }).type).toBe('jjanggu')
  })

  it('1번 모름 경로에서는 봉긋한 라인과 가중된 6번으로 짱구에 도달한다', () => {
    const result = scoreAnswers({ ...neutral, shape: 'unsure', backline: 'pointy', tummy: 'enjoys' })
    expect(result.points.jjanggu).toBe(4)
    expect(result.type).toBe('jjanggu')
  })

  it('가중은 습관 문항에만 적용되고, 습관 신호 하나만으로는 임계에 닿지 않는다', () => {
    const result = scoreAnswers({ ...neutral, shape: 'unsure', lying: 'mostly', tummy: 'enjoys' })
    expect(result.points.banguri).toBe(2)
    expect(result.points.jjanggu).toBe(2)
    expect(result.type).toBe('donggeuri')
  })

  it('모두 모르겠다고 답해도 동글이가 된다', () => {
    const result = scoreAnswers({
      shape: 'unsure',
      backline: 'unsure',
      ears: 'unsure',
      headSide: 'unsure',
      lying: 'unsure',
      tummy: 'notYet',
      age: 'under3m',
    })
    expect(result.type).toBe('donggeuri')
  })

  it('여러 유형이 임계에 도달하면 확인 순서가 앞선 유형으로 확정한다', () => {
    const result = scoreAnswers({
      ...neutral,
      backline: 'flat',
      ears: 'oneForward',
      headSide: 'left',
      lying: 'mostly',
    })
    expect(result.points.ttaomi).toBe(3)
    expect(result.points.banguri).toBe(3)
    expect(result.type).toBe('ttaomi')
  })
})

describe('scoreAnswers — 개인화 필드', () => {
  it('고개 방향 응답을 preferredSide로 저장한다', () => {
    expect(scoreAnswers({ ...neutral, headSide: 'left' }).preferredSide).toBe('left')
    expect(scoreAnswers({ ...neutral, headSide: 'right' }).preferredSide).toBe('right')
    expect(scoreAnswers({ ...neutral, headSide: 'both' }).preferredSide).toBe('unknown')
    expect(scoreAnswers({ ...neutral, headSide: 'unsure' }).preferredSide).toBe('unknown')
  })

  it('월령과 엎드려 놀기 응답을 그대로 전달한다', () => {
    const result = scoreAnswers({ ...neutral, age: 'under3m', tummy: 'struggles' })
    expect(result.ageBand).toBe('under3m')
    expect(result.tummyReaction).toBe('struggles')
  })
})

describe('messages와 판정 상수의 정합성', () => {
  it.each([
    ['ko', koMessages],
    ['en', enMessages],
  ])('%s 문항 수와 선택지 수가 상수 모듈과 일치한다', (_, messages) => {
    const questions = messages.headTest.questions
    expect(questions).toHaveLength(questionIds.length)
    questionIds.forEach((id, index) => {
      expect(questions[index].options).toHaveLength(questionOptions[id].length)
    })
  })

  it.each([
    ['ko', koMessages],
    ['en', enMessages],
  ])('%s 결과 카피가 다섯 유형을 모두 갖는다', (_, messages) => {
    expect(Object.keys(messages.headTest.result.types).sort()).toEqual([...headTypes].sort())
  })
})
