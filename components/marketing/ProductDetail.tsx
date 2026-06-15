import Image from 'next/image'
import { Container } from '@/components/ui/Container'

const sections = [
  {
    title: '오늘 할 운동을 한눈에',
    desc: '상담 후 정한 홈케어 운동을 오늘 루틴으로 확인하고, 무리하지 않는 범위에서 시작해요.',
    image: '/images/icons/exercise.png',
    imageAlt: '오늘 할 운동을 확인하는 바로도리 기능',
    bullets: ['오늘 루틴', '운동 전 확인', '보호자 메모'],
  },
  {
    title: '누른 만큼 바로 기록',
    desc: '스톱워치와 횟수 기록으로 집에서 한 운동을 간단히 남겨요.',
    image: '/images/icons/record.png',
    imageAlt: '시간과 횟수를 기록하는 바로도리 기능',
    bullets: ['시간 기록', '횟수 기록', '아이 반응 메모'],
  },
  {
    title: '병원 가는 날도 잊지 않게',
    desc: '물리치료 방문일, 다음 예약, 상담 중 들은 안내를 함께 정리해요.',
    image: '/images/icons/schedule.png',
    imageAlt: '물리치료 방문 기록을 정리하는 바로도리 기능',
    bullets: ['방문 기록', '예약 리마인더', '상담 메모'],
  },
  {
    title: '사진·영상까지 남기는 리포트',
    desc: '운동 중 아이 반응과 참고 자료를 모아 다음 상담 전 상황을 정리해요.',
    image: '/images/icons/report.png',
    imageAlt: '사진 영상 메모를 모아 리포트로 보는 바로도리 기능',
    bullets: ['사진', '영상', '메모'],
  },
  {
    title: '달력으로 확인하는 꾸준함',
    desc: '운동한 날과 쉬어간 날을 달력에서 확인하며 홈케어 리듬을 살펴봐요.',
    image: '/images/icons/calendar.png',
    imageAlt: '운동 기록을 달력으로 확인하는 바로도리 기능',
    bullets: ['월간 보기', '연속 기록', '리포트 요약'],
  },
  {
    title: '같은 고민을 나누는 부모 커뮤니티',
    desc: '운동일지와 경험, 작은 응원을 나누며 혼자 애쓰는 느낌을 덜어요.',
    image: '/images/icons/community.png',
    imageAlt: '보호자들이 경험을 나누는 바로도리 커뮤니티 기능',
    bullets: ['경험 공유', '응원', '운영 콘텐츠'],
  },
  {
    title: '보호자의 마음도 함께',
    desc: '보호자 스트레스 상태를 참고용 컨디션 체크로 돌아보고, 혼자 짊어지는 느낌을 줄여요.',
    image: '/images/icons/caregiver.png',
    imageAlt: '보호자 컨디션을 참고용으로 체크하는 바로도리 기능',
    bullets: ['참고용 체크', '기록', '도움말'],
  },
] as const

export function ProductDetail() {
  return (
    <section className="bg-[var(--color-bg-muted)] py-24">
      <Container>
        <div className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
            핵심 기능 소개
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">하루 홈케어가 기록으로 이어지는 흐름</h2>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            운동 확인, 시간·횟수 기록, 방문 메모, 달력·리포트 확인까지 보호자의 반복 흐름을 기준으로 정리했어요.
          </p>
        </div>
      </Container>
      <div className="mt-12 space-y-20">
        {sections.map((s, i) => (
          <Container key={s.title}>
            <div className={`grid items-center gap-10 lg:grid-cols-2 ${i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                  Feature {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-4 text-3xl font-bold">{s.title}</h3>
                <p className="mt-5 leading-relaxed text-[var(--color-text-secondary)]">{s.desc}</p>
                <ul className="mt-6 space-y-2 text-sm text-[var(--color-text-secondary)]">
                  {s.bullets.map((bullet) => (
                    <li key={bullet}>• {bullet}</li>
                  ))}
                </ul>
              </div>
              <div className="grid min-h-[320px] place-items-center rounded-[16px] border border-[var(--color-border)] bg-white p-8 shadow-sm">
                <div className="relative aspect-square w-full max-w-[220px]">
                  <Image
                    src={s.image}
                    alt={s.imageAlt}
                    fill
                    sizes="(max-width: 640px) 60vw, 220px"
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </Container>
        ))}
      </div>
    </section>
  )
}
