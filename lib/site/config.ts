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
