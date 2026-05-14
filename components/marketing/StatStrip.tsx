import { Container } from '@/components/ui/Container'

const stats = [
  { value: '기록', label: '아이 상태 변화 참고' },
  { value: '루틴', label: '가정 운동 이어가기' },
  { value: '리포트', label: '보호자 기록 정리' },
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
