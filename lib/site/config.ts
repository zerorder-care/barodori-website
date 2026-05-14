export const launchCopy = {
  betaDate: '2026-06-01',
  betaLabel: '6월 1일 출시 예정',
  appDownloadPending: '앱 다운로드는 출시 후 제공됩니다.',
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
