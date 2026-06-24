export const launchCopy = {
  appStatusLabel: '홈케어 운동 기록 앱',
  liveNotice: 'iOS와 Android에서 바로도리를 설치하고 오늘의 기록을 시작하세요.',
  pendingNotice: '스토어 오픈 전까지 알림 신청으로 바로도리 소식을 먼저 받아보세요.',
  pendingCta: '다운로드 받기',
  installCta: '앱에서 기록 시작하기',
  appDownloadPending: '스토어 링크가 준비되면 이곳에서 바로 안내할게요.',
} as const

export function getExternalLinks() {
  return {
    betaForm: process.env.NEXT_PUBLIC_BETA_FORM_URL || null,
    kakaoChannel: process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || null,
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || null,
    naverBlog: process.env.NEXT_PUBLIC_NAVER_BLOG_URL || null,
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || null,
    businessInfo: process.env.NEXT_PUBLIC_BUSINESS_INFO_URL || null,
  }
}

export const companyInfo = {
  name: '주식회사 제로더',
  ceo: '심예준',
  businessNumber: '764-88-02890',
  mailOrderNumber: '2024-서울동대문-2011',
  email: 'contact@zerorder.kr',
  address: '서울 동대문구 회기로 117-3 서울바이오허브 산업지원동',
  supportHours: '평일 10:00 - 17:00',
} as const
