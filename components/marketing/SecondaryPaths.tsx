import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import type { Locale } from '@/lib/i18n/config'

const paths = [
  {
    label: '홈케어 노트',
    title: '사경이 의심되거나 기록 팁이 필요하다면',
    desc: '운동 전후로 무엇을 남기면 좋은지, 상담 전 어떤 기록을 정리하면 좋은지 확인해요.',
    href: 'articles',
  },
  {
    label: '커뮤니티',
    title: '비슷한 홈케어 하루를 보내는 보호자들과',
    desc: '운동 기록을 이어가며 생기는 질문과 경험을 나눌 수 있어요. 의료 판단은 전문의·치료사 상담을 기준으로 해주세요.',
    href: 'community',
  },
] as const

export function SecondaryPaths({ locale }: { locale: Locale }) {
  return (
    <section className="bg-white py-20" aria-labelledby="secondary-paths-title">
      <Container>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {paths.map((path) => (
            <Link
              key={path.href}
              href={`/${locale}/${path.href}`}
              className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-6 transition hover:bg-white hover:shadow-md"
            >
              <p className="text-sm font-bold text-[var(--color-primary-dark)]">{path.label}</p>
              <h3 className="mt-4 text-xl font-bold">{path.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{path.desc}</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
