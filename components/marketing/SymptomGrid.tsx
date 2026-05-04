import { Container } from '@/components/ui/Container'

const symptoms = [
  { title: '한쪽으로만 고개를 돌려요', icon: '↻' },
  { title: '머리 모양이 비대칭이에요', icon: '◐' },
  { title: '한쪽으로 누워 자기를 좋아해요', icon: '☾' },
  { title: '특정 방향으로만 시선을 둬요', icon: '◉' },
  { title: '목 옆에 단단한 멍울이 만져져요', icon: '●' },
  { title: '수유 시 한쪽 자세를 거부해요', icon: '✕' },
] as const

export function SymptomGrid() {
  return (
    <section className="py-16">
      <Container>
        <h2 className="text-center text-2xl font-bold sm:text-3xl">이런 모습이 보이면 사경을 의심해보세요</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {symptoms.map((s) => (
            <article key={s.title} className="rounded-lg border border-[--color-border] bg-white p-5">
              <div className="text-2xl text-[--color-primary]">{s.icon}</div>
              <p className="mt-3 text-sm font-medium leading-relaxed">{s.title}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
