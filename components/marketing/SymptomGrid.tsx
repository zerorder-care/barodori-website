import { Container } from '@/components/ui/Container'

const symptoms = [
  '오늘 운동을 했는지 헷갈려요',
  '몇 분, 몇 번 했는지 따로 적기 번거로워요',
  '물리치료 다녀온 날과 집에서 한 운동이 흩어져요',
  '아이 반응과 사진·영상을 진료 전 정리하기 어려워요',
] as const

export function SymptomGrid() {
  return (
    <section className="bg-white py-20">
      <Container>
        <div className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
            매일 이어가는 일이 제일 어렵다면
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">오늘 했는지, 얼마나 했는지, 어떻게 남길지</h2>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            홈케어는 거창한 계획보다 작은 기록이 쌓일 때 이어가기 쉬워져요.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {symptoms.map((title, index) => (
            <article key={title} className="min-h-52 rounded-[8px] border border-[var(--color-border)] bg-[#f7f7f7] p-8">
              <p className="text-2xl font-bold text-[#a5a5a5]">{String(index + 1).padStart(2, '0')}</p>
              <p className="mt-5 text-3xl font-bold leading-none text-[#b8b8b8]">“</p>
              <p className="mt-6 text-base font-semibold leading-relaxed">{title}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
