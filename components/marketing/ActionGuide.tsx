import { Container } from '@/components/ui/Container'

const steps = [
  ['앱 설치 및 아이 정보 등록', '앱을 다운로드하고 우리 아이 정보를 등록해요'],
  ['아이 상태 측정하기', '가이드에 따라 사진을 촬영해 상태를 측정해요'],
  ['AI 분석 결과 및 맞춤 운동 확인', '분석 리포트와 추천 운동을 확인해요'],
  ['가정에서 재활 운동 진행', '음성 가이드와 함께 루틴을 진행해요'],
]

export function ActionGuide() {
  return (
    <section className="bg-white py-24">
      <Container>
        <div className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
            이용 방법
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">단 4단계로 시작하는 가정 재활</h2>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">앱 설치부터 운동까지, 어렵지 않아요</p>
        </div>
        <ol className="mt-12 grid gap-6 lg:grid-cols-4">
          {steps.map(([title, desc], i) => (
            <li key={title} className="relative rounded-[8px] border border-[var(--color-border)] bg-[#f7f7f7] p-7 text-center">
              {i < steps.length - 1 && (
                <span className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-2xl text-[#9b9b9b] lg:block">
                  →
                </span>
              )}
              <p className="text-xs font-semibold uppercase text-[var(--color-text-secondary)]">Step {String(i + 1).padStart(2, '0')}</p>
              <div className="mx-auto mt-5 grid h-24 w-24 place-items-center rounded-full border border-dashed border-[#b9b9b9] bg-[#e7e7e7] text-xs text-[var(--color-text-secondary)]">
                일러스트
              </div>
              <h3 className="mt-5 text-lg font-bold leading-snug">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{desc}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
