import { isLocale } from '@/lib/i18n/dictionary'
import { notFound } from 'next/navigation'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">바로도리 ({locale})</h1>
      <p>홈 페이지 — Task 11에서 완성됩니다.</p>
    </main>
  )
}
