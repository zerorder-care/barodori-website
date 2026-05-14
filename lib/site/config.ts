export const launchCopy = {
  betaDate: '2026-05-20',
  betaLabel: '베타 출시 예정',
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
  ceo: '확인 중',
  businessNumber: '확인 중',
  mailOrderNumber: '확인 중',
  email: 'contact@zerorder.kr',
  address: '확인 중',
  supportHours: '평일 10:00 - 17:00',
} as const

