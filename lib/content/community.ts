export type CommunityCategory = 'talk' | 'question' | 'hope_diary' | 'official_content'
export type CommunitySort = 'latest' | 'popular'

export type CommunityComment = {
  id: string
  author: string
  content: string
  likeCount: number
  createdAt: string
  replies?: CommunityComment[]
}

export type CommunityPost = {
  id: string
  category: CommunityCategory
  author: string
  babyAge: string
  title: string
  preview: string
  body: string[]
  likeCount: number
  commentCount: number
  createdAt: string
  recentComment?: string
  thumbnail?: string
  comments: CommunityComment[]
}

export const communityCategories = [
  { value: 'all', label: '전체' },
  { value: 'talk', label: '소통방' },
  { value: 'question', label: '질문방' },
  { value: 'hope_diary', label: '희망일기' },
  { value: 'official_content', label: '바로도리 콘텐츠' },
] as const

export const communityPosts: CommunityPost[] = [
  {
    id: 'community-1',
    category: 'question',
    author: '도리맘',
    babyAge: '4개월',
    title: '터미타임을 너무 싫어할 때는 어떻게 하세요?',
    preview: '하루에 조금씩 해보는데 울음이 길어져서 방법을 바꿔야 할지 고민이에요.',
    body: [
      '터미타임을 시작하면 1분도 안 돼서 울어서 매번 멈추고 있어요.',
      '병원에서는 짧게 자주 해보라고 했는데, 보호자 입장에서는 아이가 힘들어하는 것 같아 망설여집니다.',
      '다른 분들은 처음에 시간을 어떻게 늘리셨는지 궁금해요.',
    ],
    likeCount: 18,
    commentCount: 6,
    createdAt: '2026-05-11T09:30:00+09:00',
    recentComment: '가슴 아래에 수건을 말아 받쳐주니 조금 나아졌어요.',
    comments: [
      {
        id: 'comment-1',
        author: '봄이아빠',
        content: '저희는 20초부터 시작해서 아이 컨디션 좋은 시간에만 했어요.',
        likeCount: 4,
        createdAt: '2026-05-11T10:10:00+09:00',
      },
      {
        id: 'comment-2',
        author: '라온맘',
        content: '장난감을 정면보다 살짝 옆에 두니 고개 돌리는 연습도 같이 됐어요.',
        likeCount: 3,
        createdAt: '2026-05-11T11:20:00+09:00',
      },
    ],
  },
  {
    id: 'community-2',
    category: 'hope_diary',
    author: '튼튼맘',
    babyAge: '6개월',
    title: '오늘은 오른쪽으로 고개 돌리는 시간이 조금 늘었어요',
    preview: '아주 작은 변화지만 기록으로 남기니 마음이 놓입니다.',
    body: [
      '지난주보다 오른쪽으로 따라보는 시간이 조금 길어졌어요.',
      '아직 매일 컨디션 차이는 있지만 기록이 쌓이니까 조급함이 줄어드는 느낌입니다.',
    ],
    likeCount: 31,
    commentCount: 9,
    createdAt: '2026-05-10T20:15:00+09:00',
    recentComment: '작은 변화도 정말 큰 힘이 되죠. 응원합니다.',
    comments: [
      {
        id: 'comment-3',
        author: '도담맘',
        content: '저도 기록 보면서 버티는 중이에요. 같이 힘내요.',
        likeCount: 7,
        createdAt: '2026-05-10T21:00:00+09:00',
      },
    ],
  },
  {
    id: 'community-3',
    category: 'official_content',
    author: '바로도리',
    babyAge: '운영진',
    title: '측정 전 아이 컨디션을 먼저 확인해주세요',
    preview: '정확한 기록을 위해 촬영 전 확인하면 좋은 체크포인트를 안내드려요.',
    body: [
      '아이가 배고프거나 졸린 시간에는 촬영 자세가 쉽게 흐트러질 수 있어요.',
      '측정은 아이가 비교적 편안한 시간에, 보호자 두 명이 함께 진행하면 더 안정적입니다.',
    ],
    likeCount: 42,
    commentCount: 4,
    createdAt: '2026-05-09T13:00:00+09:00',
    comments: [
      {
        id: 'comment-4',
        author: '하루맘',
        content: '촬영 전에 체크할 수 있어 도움이 됐어요.',
        likeCount: 2,
        createdAt: '2026-05-09T14:10:00+09:00',
      },
    ],
  },
]

export function getCommunityPost(id: string): CommunityPost | undefined {
  return communityPosts.find((post) => post.id === id)
}

