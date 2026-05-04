import Image from 'next/image'
import { Container } from '@/components/ui/Container'

const sections = [
  {
    title: 'AI 머리 모양 진단',
    desc: '아이 정면/측면 사진을 찍으면 AI가 비대칭 지수를 산출합니다. 시간 흐름에 따른 변화를 그래프로 추적하세요.',
    image: '/images/hero-app.png',
  },
  {
    title: '맞춤 가정 운동',
    desc: '월령별/증상별로 전문가 검토를 거친 가정 운동을 제공합니다. 동작은 영상과 단계별 설명으로 안내합니다.',
    image: '/images/hero-app.png',
  },
  {
    title: '진료 가이드',
    desc: '병원 방문 전 체크리스트, 의료진 문의 시나리오, 진료 후 기록까지. 보호자가 헷갈리지 않도록.',
    image: '/images/hero-app.png',
  },
] as const

export function ProductDetail() {
  return (
    <div className="py-16">
      {sections.map((s, i) => (
        <Container key={s.title} className="my-12">
          <div className={`grid items-center gap-10 sm:grid-cols-2 ${i % 2 === 1 ? 'sm:[&>*:first-child]:order-2' : ''}`}>
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">{s.title}</h2>
              <p className="mt-3 leading-relaxed text-[--color-text-secondary]">{s.desc}</p>
            </div>
            <div className="relative aspect-[3/4] w-full max-w-xs sm:mx-auto">
              <Image src={s.image} alt={s.title} fill className="object-contain" />
            </div>
          </div>
        </Container>
      ))}
    </div>
  )
}
