import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import type { Locale } from '@/lib/i18n/config'

const features = [
  { title: 'AI 머리 모양 진단', desc: '사진 한 장으로 비대칭 정도를 객관 수치로 확인' },
  { title: '맞춤 가정 운동', desc: '월령별/증상별로 전문가 검토를 거친 운동 가이드' },
  { title: '진료 가이드', desc: '병원 방문 전 체크리스트와 의료진 문의 시나리오' },
] as const

export function ProductFeatures({ locale }: { locale: Locale }) {
  return (
    <section className="py-16">
      <Container>
        <h2 className="text-center text-2xl font-bold sm:text-3xl">바로도리는 이렇게 도와줘요</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="rounded-lg border border-[--color-border] bg-white p-5">
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[--color-text-secondary]">{f.desc}</p>
            </article>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href={`/${locale}/product`} className="text-sm font-semibold text-[--color-primary-dark] underline">
            제품 자세히 보기 →
          </Link>
        </div>
      </Container>
    </section>
  )
}
