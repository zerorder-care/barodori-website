import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import { Container } from '@/components/ui/Container'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '바로도리 개인정보처리방침',
  robots: { index: false, follow: false },
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold">개인정보처리방침</h1>
      <p className="mt-2 text-sm text-[--color-text-secondary]">시행일: 작성 중</p>
      <div className="mt-8 rounded-lg border border-dashed border-[--color-border] bg-[--color-bg-muted] p-6 text-sm leading-relaxed text-[--color-text-secondary]">
        본 페이지는 placeholder 입니다. 정식 본문은 법무 검토 후 업데이트됩니다.
        문의: <a href="mailto:contact@barodori.com" className="underline">contact@barodori.com</a>
      </div>
    </Container>
  )
}
