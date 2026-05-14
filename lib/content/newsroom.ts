export type NewsroomCategory = 'notice' | 'press' | 'partnership' | 'event'

export type NewsroomContentBlock = {
  type?: string
  content?: string
  text?: string
  imageUrl?: string | null
  image_url?: string | null
  thumbnailUrl?: string | null
  thumbnail_url?: string | null
  url?: string | null
  src?: string | null
  alt?: string
}

export type NewsroomPost = {
  id: string
  category: NewsroomCategory
  title: string
  excerpt: string
  publishedAt: string
  href?: string
  thumbnail?: string
  content?: NewsroomContentBlock[]
}

export const newsroomCategories = [
  { value: 'all', label: '전체' },
  { value: 'notice', label: '공지' },
  { value: 'press', label: '보도자료' },
  { value: 'partnership', label: '제휴' },
  { value: 'event', label: '이벤트' },
] as const

export const newsroomPosts: NewsroomPost[] = [
  {
    id: 'news-1',
    category: 'notice',
    title: '바로도리 베타 서포터즈 모집 안내',
    excerpt: '정식 출시 전 바로도리를 먼저 사용해보고 의견을 나눠주실 보호자를 모집합니다.',
    publishedAt: '2026-05-12',
  },
  {
    id: 'news-2',
    category: 'press',
    title: '제로더, 영유아 가정 관리 보조 서비스 개발',
    excerpt: '보호자가 집에서도 아이 상태를 꾸준히 기록하고 운동을 이어갈 수 있도록 돕는 앱을 준비 중입니다.',
    publishedAt: '2026-05-08',
  },
  {
    id: 'news-3',
    category: 'partnership',
    title: '정보 콘텐츠 검토 기준 준비',
    excerpt: '사경/사두 정보 콘텐츠를 더 조심스럽고 명확한 표현으로 제공하기 위한 검토 기준을 마련하고 있습니다.',
    publishedAt: '2026-04-30',
  },
]
