import { Container } from '@/components/ui/Container'

const stats = [
  { value: '목표', label: '오늘 할 운동을 목표로 설정' },
  { value: '달성', label: '연속 운동으로 꾸준함 확인' },
  { value: '기록', label: '운동·물리치료를 한곳에' },
] as const

export function StatStrip() {
  return (
    <section aria-label="핵심 통계" className="border-y border-[var(--color-border)] bg-white py-10">
      <Container className="grid grid-cols-3 gap-4 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-2xl font-bold text-[var(--color-primary-dark)] sm:text-3xl">{s.value}</p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)] sm:text-sm">{s.label}</p>
          </div>
        ))}
      </Container>
    </section>
  )
}
