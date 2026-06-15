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
    excerpt: '스토어 오픈 전 바로도리를 먼저 사용해보고 홈케어 운동 기록 경험을 나눠주실 보호자를 모집해요.',
    publishedAt: '2026-05-12',
  },
  {
    id: 'news-2',
    category: 'press',
    title: '제로더, 우리 아이 홈케어 운동 기록 앱 바로도리 준비',
    excerpt: '집에서 한 운동과 아이 반응을 기록하고 달력·리포트로 확인할 수 있는 보호자 중심 앱을 준비 중이에요.',
    publishedAt: '2026-05-08',
  },
  {
    id: 'news-3',
    category: 'partnership',
    title: '정보 콘텐츠 검토 기준 준비',
    excerpt: '홈케어 노트가 진단이나 치료 판단을 대신하지 않도록 참고 정보 검토 기준을 마련하고 있어요.',
    publishedAt: '2026-04-30',
  },
]
