import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return {}
}

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  notFound()
}
