import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import type { Locale } from '@/lib/i18n/config'

const paths = [
  {
    label: '바로도리 컨텐츠',
    title: '사경이 의심되거나 기록 팁이 필요하다면',
    desc: '운동 전후로 무엇을 남기면 좋은지, 상담 전 어떤 기록을 정리하면 좋은지 확인해요.',
    href: 'articles',
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
