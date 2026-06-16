import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { GoalCardMockup } from '@/components/marketing/GoalAchievement'
import { AUTH_ACCESS_COOKIE } from '@/lib/auth/session'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return buildMetadata({
    title: '마이페이지 - 바로도리',
    description: '내 정보, 아이 정보, 활동 내역을 확인하세요.',
    path: `/${locale}/mypage`,
    locale,
  })
}

export default async function MyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const authenticated = Boolean((await cookies()).get(AUTH_ACCESS_COOKIE)?.value)

  return (
    <>
      <section className="bg-[var(--color-bg-muted)] py-16">
        <Container>
          <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
            마이페이지
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight">내 정보와 아이의 진행 상태를 한눈에</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
            앱과 동일한 계정으로 로그인하면 내 정보와 아이 정보를 확인할 수 있어요. 목표 달성과 연속 운동은 앱에서 실시간으로 이어져요.
          </p>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
                우리 아이 진행 상태
                <span className="rounded-pill bg-white px-2 py-0.5 text-[11px] font-bold text-[var(--color-text-secondary)]">예시</span>
              </p>
              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">목표 달성과 연속 운동을 앱에서 확인해요</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
                아래는 앱에서 보는 예시 화면이에요. 앱에 로그인하면 우리 아이의 실제 기록으로 채워져요.
              </p>
            </div>
            <Link
              href={`/${locale}/install`}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-5 text-sm font-bold text-[var(--color-text-primary)]"
            >
              앱에서 전체 보기 →
            </Link>
          </div>
          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,420px)_1fr]">
            <GoalCardMockup />
            <ul className="grid gap-5">
              {[
                ['오늘의 목표 달성', '운동별 목표를 채우고, 모두 달성한 날에는 작은 축하를 만나요.'],
                ['연속 운동', '며칠째 이어오고 있는지 한눈에 확인하며 꾸준함을 이어가요.'],
                ['운동·물리치료 기록', '집에서 한 운동과 병원 방문, 아이 반응을 한곳에 남겨요.'],
                ['아이 정보 관리', '아이의 기본 정보와 기록 흐름을 앱과 함께 확인해요.'],
              ].map(([title, body]) => (
                <li key={title} className="rounded-[8px] border border-[var(--color-border)] bg-white p-5">
                  <h3 className="text-base font-bold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <Container className="py-16">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="self-start rounded-[8px] border border-[var(--color-border)] bg-white p-6">
            <div className="grid h-20 w-20 place-items-center rounded-full border border-dashed border-[#b9b9b9] bg-[#e6e6e6] text-xs text-[var(--color-text-secondary)]">
              프로필
            </div>
            <h2 className="mt-5 text-2xl font-bold">사용자님</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {authenticated ? '앱과 동일한 계정으로 로그인되어 있어요.' : '로그인 후 내 정보를 확인할 수 있어요.'}
            </p>
            {!authenticated && (
              <Link
                href={`/${locale}/login?next=/${locale}/mypage`}
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-5 text-sm font-bold text-[var(--color-text-primary)]"
              >
                로그인하기
              </Link>
            )}
            <nav className="mt-6 grid gap-2 border-t border-[var(--color-border)] pt-5 text-sm font-semibold">
              {['내 정보', '아이 정보', '내 활동', '계정 관리'].map((item, index) => (
                <a
                  key={item}
                  href={`#mypage-${index}`}
                  className={`rounded-[8px] px-4 py-3 ${
                    index === 0 ? 'bg-[var(--color-bg-muted)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'
                  }`}
                >
                  {item}
                </a>
              ))}
            </nav>
          </aside>
          <div className="grid gap-4">
            <MypageSection
              id="mypage-0"
              title="내 정보"
              description="홈페이지와 앱에서 함께 사용하는 보호자 정보예요."
              items={['프로필 이미지', '닉네임', '생년월일', '성별', '휴대폰', '주소']}
            />
            <MypageSection
              id="mypage-1"
              title="아이 정보"
              description="다자녀 등록과 기본 건강 상태 정보는 앱과 동일하게 관리돼요."
              items={['아이 프로필', '이름', '생년월일', '성별', '목 가눔 여부', '사경 유형', '머리 모양']}
            />
            <MypageSection
              id="mypage-2"
              title="내 활동"
              description="바로도리 앱에서 이어지는 기록 활동을 확인해요."
              items={['운동 기록', '목표 달성', '연속 운동']}
            />
            <section id="mypage-3" className="rounded-[8px] bg-[#303030] p-6 text-sm leading-relaxed text-white/75">
              <h2 className="text-xl font-bold text-white">앱에서 이어지는 기능</h2>
              <p className="mt-3">
                목표 달성, 연속 운동, 운동 기록은 앱에서 실시간으로 확인할 수 있어요. 홈페이지 마이페이지는 계정과
                아이 정보를 함께 관리해요.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </>
  )
}

function MypageSection({
  id,
  title,
  description,
  items,
}: {
  id: string
  title: string
  description: string
  items: string[]
}) {
  return (
    <section id={id} className="rounded-[8px] border border-[var(--color-border)] bg-white p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{description}</p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center rounded-[8px] border border-[var(--color-border)] px-4 text-sm font-bold"
        >
          수정
        </button>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex min-h-12 items-center justify-between rounded-[8px] bg-[var(--color-bg-muted)] px-4 text-sm"
          >
            <span className="font-semibold">{item}</span>
            <span className="text-[var(--color-text-secondary)]">미입력</span>
          </div>
        ))}
      </div>
    </section>
  )
}
