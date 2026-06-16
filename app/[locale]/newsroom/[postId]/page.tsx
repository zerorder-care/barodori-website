import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; postId: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return {}
}

export default async function NewsroomDetailPage({
  params,
}: {
  params: Promise<{ locale: string; postId: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  notFound()
}
