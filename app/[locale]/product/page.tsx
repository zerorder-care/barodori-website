import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Container } from '@/components/ui/Container'
import { ProductDetail } from '@/components/marketing/ProductDetail'
import { InstallCta } from '@/components/marketing/InstallCta'
import { SafetyNotice } from '@/components/marketing/SafetyNotice'
import type { Locale } from '@/lib/i18n/config'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return buildMetadata({
    title: '아기·영유아 홈케어 운동 기록 기능 - 바로도리',
    description: '오늘 할 아기 홈케어 운동, 영유아 운동 기록, 시간·횟수 기록, 물리치료 방문 기록, 달력·리포트를 한곳에서 확인하세요.',
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
      <section className="bg-[var(--color-bg-muted)] py-20">
        <Container className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
            기록 기능
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            홈케어 운동이 하루 기록으로 남는 방식
          </h1>
          <p className="mx-auto mt-5 max-w-3xl leading-relaxed text-[var(--color-text-secondary)]">
            바로도리는 집에서 한 운동과 아이의 반응, 물리치료 방문 기록을 한곳에 모아 달력과 리포트로 확인할 수 있게 돕습니다. 운동 방법과 강도는 담당 전문의·치료사와 상담 후 진행해 주세요.
          </p>
        </Container>
      </section>
      <section className="bg-white py-20">
        <Container>
          <div className="text-center">
            <p className="inline-flex rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
              공감 영역
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">이런 고민, 있으신가요?</h2>
            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
              홈케어 운동을 집에서 이어가는 보호자가 자주 마주하는 기록의 빈틈입니다.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              '오늘 루틴을 어디서부터 시작해야 할지 막막해요',
              '운동 시간과 횟수를 따로 적기 어려워요',
              '병원에서 들은 내용을 집에 오면 놓칠 때가 있어요',
              '사진, 영상, 메모가 흩어져 상담 전에 정리하기 힘들어요',
              '꾸준히 하고 있는지 한눈에 보고 싶어요',
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
            <p className="inline-flex rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
              서비스 방향
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">기록이 있으면 다음 상담도, 다음 운동도 덜 막막해집니다</h2>
            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
              바로도리는 판단을 대신하기보다 보호자가 아이의 홈케어 흐름을 차분히 정리하도록 돕는 기록 도구입니다.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              ['운동은 상담 후 진행', '운동 방법과 강도는 담당 전문의·치료사 상담을 기준으로 합니다.'],
              ['기록은 참고 자료로 활용', '사진, 영상, 메모는 보호자가 상황을 정리하기 위한 참고 자료입니다.'],
              ['꾸준함을 달력으로 확인', '운동한 날과 쉬어간 날을 한눈에 보며 홈케어 루틴을 돌아봅니다.'],
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
