import { Container } from '@/components/ui/Container'

const steps = [
  '아기의 정면/측면 사진을 찍어 비교해보세요',
  '하루 동안 머리 방향을 기록해보세요',
  '수유/수면 자세에 변화를 주세요',
  '소아청소년과 또는 재활의학과를 방문하세요',
  '가정 운동은 전문가 검토 가이드만 따르세요',
]

export function ActionGuide() {
  return (
    <section className="bg-[--color-bg-muted] py-16">
      <Container>
        <h2 className="text-center text-2xl font-bold sm:text-3xl">의심되면 이렇게 시작해보세요</h2>
        <ol className="mx-auto mt-8 grid max-w-3xl gap-3">
          {steps.map((step, i) => (
            <li key={step} className="flex gap-4 rounded-lg bg-white p-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[--color-primary] text-sm font-bold">
                {i + 1}
              </span>
              <p className="self-center text-sm leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
