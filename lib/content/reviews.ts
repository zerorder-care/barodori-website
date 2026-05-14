export type ReviewCondition = 'torticollis' | 'head-shape' | 'both'
export type ReviewAgeGroup = '0-6' | '6-12' | '12+'

export type ParentReview = {
  id: string
  ageGroup: ReviewAgeGroup
  babyAge: string
  condition: ReviewCondition
  rating: number
  title: string
  body: string
  duration: string
  writtenAt: string
}

export type ExpertRecommendation = {
  id: string
  name: string
  role: string
  organization: string
  quote: string
}

export type MediaMention = {
  id: string
  outlet: string
  title: string
  publishedAt: string
  href: string
}

export const reviewAgeGroups = [
  { value: 'all', label: '전체' },
  { value: '0-6', label: '0~6개월' },
  { value: '6-12', label: '6~12개월' },
  { value: '12+', label: '12개월 이상' },
] as const

export const reviewConditions = [
  { value: 'all', label: '전체' },
  { value: 'torticollis', label: '사경' },
  { value: 'head-shape', label: '사두' },
  { value: 'both', label: '사경+사두' },
] as const

export const parentReviews: ParentReview[] = [
  {
    id: 'review-1',
    ageGroup: '0-6',
    babyAge: '4개월 아기 보호자',
    condition: 'torticollis',
    rating: 5,
    title: '집에서 무엇을 해야 할지 정리된 느낌이었어요',
    body: '병원에서 들은 운동을 집에 오면 자꾸 잊었는데, 바로도리에서 루틴으로 보니 하루 계획을 세우기 쉬웠어요.',
    duration: '3주 사용',
    writtenAt: '2026-05-02',
  },
  {
    id: 'review-2',
    ageGroup: '0-6',
    babyAge: '5개월 아기 보호자',
    condition: 'both',
    rating: 5,
    title: '눈대중이 아니라 기록으로 남는 점이 안심됐어요',
    body: '매번 좋아지는지 헷갈렸는데 측정 기록과 리포트를 보면서 아이 상태를 더 차분하게 볼 수 있었습니다.',
    duration: '1개월 사용',
    writtenAt: '2026-04-25',
  },
  {
    id: 'review-3',
    ageGroup: '6-12',
    babyAge: '8개월 아기 보호자',
    condition: 'head-shape',
    rating: 4,
    title: '운동 시간이 가족 모두에게 덜 부담스러워졌어요',
    body: '아이 반응을 보며 짧게 반복할 수 있어 좋았고, 기록이 남으니 다른 보호자와도 상황을 공유하기 쉬웠어요.',
    duration: '6주 사용',
    writtenAt: '2026-04-12',
  },
]

export const expertRecommendations: ExpertRecommendation[] = [
  {
    id: 'expert-1',
    name: '서지현 교수',
    role: '재활의학과',
    organization: '분당서울대학교병원',
    quote:
      '가정에서 보호자가 아이 상태를 꾸준히 관찰하고 안전하게 운동을 이어갈 수 있도록 돕는 보조 도구의 역할이 중요합니다.',
  },
]

export const mediaMentions: MediaMention[] = [
  {
    id: 'media-1',
    outlet: '바로도리 뉴스',
    title: 'AI 기반 영유아 가정 재활 보조 앱 바로도리 베타 준비',
    publishedAt: '2026-05-10',
    href: '/ko/newsroom',
  },
]

