import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Container } from '@/components/ui/Container'
import { Hero } from '@/components/marketing/Hero'
import { ProductDetail } from '@/components/marketing/ProductDetail'
import { InstallCta } from '@/components/marketing/InstallCta'
import { SafetyNotice } from '@/components/marketing/SafetyNotice'
import type { Locale } from '@/lib/i18n/config'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return buildMetadata({
    title: '제품 소개 - 바로도리',
    description: '바로도리 앱의 핵심 기능: AI 머리 모양 진단, 맞춤 가정 운동, 진료 가이드',
    path: `/${locale}/product`,
    locale,
  })
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  return (
    <>
      <Hero locale={loc} />
      <section className="bg-white py-20">
        <Container>
          <div className="text-center">
            <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
              공감 영역
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">이런 고민, 있으신가요?</h2>
            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
              사경 · 사두 재활을 집에서 이어가는 부모님들이 가장 많이 마주하는 어려움이에요
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              '집에서 어떻게 운동시켜야 할지 막막해요',
              '아이 상태가 좋아지고 있는지 눈대중으로는 알기 어려워요',
              '병원을 자주 오가는 게 부담돼요',
              '어떤 운동을 얼마나 반복해야 효과적인지 모르겠어요',
              '인터넷 정보가 우리 아이에게 맞는지 확신이 안 서요',
            ].map((item, index) => (
              <div
                key={item}
                className="min-h-48 rounded-[8px] border border-[var(--color-border)] bg-[#f7f7f7] p-6 text-sm font-semibold leading-relaxed"
              >
                <p className="mb-8 text-xl font-bold text-[#a5a5a5]">{String(index + 1).padStart(2, '0')}</p>
                {item}
              </div>
            ))}
          </div>
        </Container>
      </section>
      <ProductDetail />
      <SafetyNotice locale={loc} />
      <section className="bg-[var(--color-bg-muted)] py-24">
        <Container>
          <div className="text-center">
            <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
              차별점 · 전문성
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">왜 바로도리인가요?</h2>
            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
              실제 경험에서 출발해, 의료진과 함께 만들고, 객관적 데이터로 검증해요
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              ['실제 경험에서 출발', '대표의 자녀 사경 경험을 바탕으로 보호자 관점의 불안을 줄이는 흐름을 설계했습니다.'],
              ['전문 의료진 협업', '분당서울대학교병원 재활의학과 서지현 교수와의 협업을 통해 서비스 완성도를 높이고 있습니다.'],
              ['객관적 측정 기반', '주관적 판단의 한계를 보완하도록 AI 기반 측정과 기록 흐름을 제공합니다.'],
            ].map(([title, body], index) => (
              <article key={title} className="rounded-[8px] border border-[var(--color-border)] bg-white p-8">
                <p className="text-2xl font-bold text-[#a5a5a5]">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
      <InstallCta locale={loc} surface="product_footer" />
    </>
  )
}
