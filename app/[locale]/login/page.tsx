import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'

const providers = ['카카오톡', 'Google', 'Naver', 'Apple'] as const

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return buildMetadata({
    title: '로그인 - 바로도리',
    description: '바로도리 계정으로 로그인하고 커뮤니티와 마이페이지를 이용하세요.',
    path: `/${locale}/login`,
    locale,
  })
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <section className="bg-[var(--color-bg-muted)] py-20">
      <Container>
        <div className="mx-auto max-w-md rounded-[8px] border border-[var(--color-border)] bg-white p-8">
          <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
            Account
          </p>
          <h1 className="mt-5 text-3xl font-bold">로그인 / 회원가입</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            홈페이지는 소셜 로그인만 지원합니다. 앱과 같은 계정으로 로그인하면 사용자님 정보를 이어서 사용할 수 있고,
            앱에서는 필요한 온보딩을 다시 진행합니다.
          </p>
          <div className="mt-6 grid gap-3">
            {providers.map((provider) => (
              <button
                key={provider}
                type="button"
                className="min-h-12 rounded-[8px] border border-[var(--color-border)] px-4 text-sm font-bold transition hover:bg-[var(--color-bg-muted)]"
              >
                {provider}로 계속하기
              </button>
            ))}
          </div>
          <p className="mt-5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
            계속 진행하면{' '}
            <Link href={`/${locale}/legal/terms`} className="font-semibold underline">
              이용약관
            </Link>
            과{' '}
            <Link href={`/${locale}/legal/privacy`} className="font-semibold underline">
              개인정보처리방침
            </Link>
            에 동의한 것으로 간주됩니다.
          </p>
        </div>
      </Container>
    </section>
  )
}
