// 앱 출시 완료: 스토어 링크를 기본값으로 제공한다. 환경 변수로 덮어쓸 수 있다.
const DEFAULT_IOS_APP_URL =
  'https://apps.apple.com/kr/app/%EB%B0%94%EB%A1%9C%EB%8F%84%EB%A6%AC/id6767132186'
const DEFAULT_ANDROID_APP_URL =
  'https://play.google.com/store/apps/details?id=com.zerorder.barodori'

export function getStoreLinks() {
  return {
    ios: process.env.NEXT_PUBLIC_IOS_APP_URL || DEFAULT_IOS_APP_URL,
    android: process.env.NEXT_PUBLIC_ANDROID_APP_URL || DEFAULT_ANDROID_APP_URL,
  }
}

export function isAppLive(): boolean {
  const { ios, android } = getStoreLinks()
  return Boolean(ios && android)
}

export function getBetaFormUrl(): string | null {
  return process.env.NEXT_PUBLIC_BETA_FORM_URL || null
}
