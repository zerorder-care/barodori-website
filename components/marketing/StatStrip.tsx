import { Container } from '@/components/ui/Container'

const stats = [
  { value: '1/250', label: '영아 사경 빈도', source: 'Pediatrics, 2018' },
  { value: '0–6개월', label: '권장 진단 시기' },
  { value: '90%', label: '조기 조치 시 회복률' },
] as const

export function StatStrip() {
  return (
    <section aria-label="핵심 통계" className="border-y border-[var(--color-border)] bg-white py-10">
      <Container className="grid grid-cols-3 gap-4 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-2xl font-bold text-[var(--color-primary-dark)] sm:text-3xl">{s.value}</p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)] sm:text-sm">{s.label}</p>
            {'source' in s && s.source && (
              <p className="mt-0.5 text-[10px] text-[var(--color-text-secondary)]/70">출처: {s.source}</p>
            )}
          </div>
        ))}
      </Container>
    </section>
  )
}
