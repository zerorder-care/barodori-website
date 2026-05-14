import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { HeaderNav } from './HeaderNav'

export async function Header({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale)
  return <HeaderNav locale={locale} appName={dict.common.appName} labels={dict.nav} />
}
