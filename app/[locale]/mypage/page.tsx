import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
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
          <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
            마이페이지
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight">내 정보와 활동을 한눈에 확인하세요</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
            앱과 동일한 계정으로 로그인하면 내 정보, 아이 정보, 커뮤니티 활동을 확인할 수 있습니다.
          </p>
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
              {authenticated ? '앱과 동일한 계정으로 로그인되어 있습니다.' : '로그인 후 내 정보를 확인할 수 있습니다.'}
            </p>
            {!authenticated && (
              <Link
                href={`/${locale}/login?next=/${locale}/mypage`}
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-5 text-sm font-bold text-white"
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
              description="홈페이지와 앱에서 함께 사용하는 보호자 정보입니다."
              items={['프로필 이미지', '닉네임', '생년월일', '성별', '휴대폰', '주소']}
            />
            <MypageSection
              id="mypage-1"
              title="아이 정보"
              description="다자녀 등록과 기본 건강 상태 정보는 앱과 동일하게 관리됩니다."
              items={['아이 프로필', '이름', '생년월일', '성별', '목 가눔 여부', '사경 유형', '머리 모양']}
            />
            <MypageSection
              id="mypage-2"
              title="내 활동"
              description="커뮤니티에서 작성하거나 반응한 활동을 확인합니다."
              items={['내가 작성한 글', '내가 작성한 댓글', '좋아요한 글']}
            />
            <section id="mypage-3" className="rounded-[8px] bg-[#303030] p-6 text-sm leading-relaxed text-white/75">
              <h2 className="text-xl font-bold text-white">앱 전용 기능 안내</h2>
              <p className="mt-3">
                운동 기록과 상태 기록은 앱에서 확인할 수 있습니다. 홈페이지 마이페이지는 계정과 커뮤니티 활동 중심으로
                제공될 예정입니다.
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
