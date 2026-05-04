export function getStoreLinks() {
  return {
    ios: process.env.NEXT_PUBLIC_IOS_APP_URL || null,
    android: process.env.NEXT_PUBLIC_ANDROID_APP_URL || null,
  }
}

export function isAppLive(): boolean {
  const { ios, android } = getStoreLinks()
  return Boolean(ios && android)
}

export function getBetaFormUrl(): string | null {
  return process.env.NEXT_PUBLIC_BETA_FORM_URL || null
}
