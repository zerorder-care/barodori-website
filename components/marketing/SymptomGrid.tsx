import { Container } from '@/components/ui/Container'

const symptoms = [
  '병원 안내만으로는 집에서 어떻게 운동시켜야 할지 막막해요',
  '아이 상태가 좋아지고 있는 건지 눈대중으로는 알기 어려워요',
  '면역력 약한 아이를 데리고 병원을 자주 오가는 게 부담돼요',
] as const

export function SymptomGrid() {
  return (
    <section className="bg-white py-20">
      <Container>
        <div className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
            공감 영역
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">이런 고민, 있으신가요?</h2>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            가정에서 사경 · 사두 관리를 이어가는 부모님들이 가장 많이 호소하는 어려움이에요
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
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
