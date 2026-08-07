import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { GoalCardMockup } from '@/components/marketing/GoalAchievement'
import { AUTH_ACCESS_COOKIE } from '@/lib/auth/session'
import { getDictionary, isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const dict = await getDictionary(locale)
  return buildMetadata({
    title: dict.mypage.seo.title,
    description: dict.mypage.seo.description,
    path: `/${locale}/mypage`,
    locale,
  })
}

export default async function MyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  const authenticated = Boolean((await cookies()).get(AUTH_ACCESS_COOKIE)?.value)

  return (
    <>
      <section className="bg-[var(--color-bg-muted)] py-16">
        <Container>
          <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
            {dict.mypage.eyebrow}
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight">{dict.mypage.title}</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
            {dict.mypage.description}
          </p>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
                {dict.mypage.progressEyebrow}
                <span className="rounded-pill bg-white px-2 py-0.5 text-[11px] font-bold text-[var(--color-text-secondary)]">{dict.mypage.exampleBadge}</span>
              </p>
              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">{dict.mypage.progressTitle}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {dict.mypage.progressBody}
              </p>
            </div>
            <Link
              href={`/${locale}/install`}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-5 text-sm font-bold text-[var(--color-text-primary)]"
            >
              {dict.mypage.appViewCta}
            </Link>
          </div>
          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,420px)_1fr]">
            <GoalCardMockup copy={dict.mypage.goalMockup} />
            <ul className="grid gap-5">
              {dict.mypage.highlights.map(([title, body]) => (
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
              {dict.mypage.profilePlaceholder}
            </div>
            <h2 className="mt-5 text-2xl font-bold">{dict.mypage.userName}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {authenticated ? dict.mypage.authenticatedBody : dict.mypage.unauthenticatedBody}
            </p>
            {!authenticated && (
              <Link
                href={`/${locale}/login?next=/${locale}/mypage`}
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-5 text-sm font-bold text-[var(--color-text-primary)]"
              >
                {dict.mypage.loginCta}
              </Link>
            )}
            <nav className="mt-6 grid gap-2 border-t border-[var(--color-border)] pt-5 text-sm font-semibold">
              {dict.mypage.navItems.map((item, index) => (
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
            {dict.mypage.sections.map((section, index) => (
              <MypageSection
                key={section.title}
                id={`mypage-${index}`}
                title={section.title}
                description={section.description}
                items={section.items}
                actionLabel={dict.mypage.edit}
                emptyLabel={dict.mypage.empty}
              />
            ))}
            <section id="mypage-3" className="rounded-[8px] bg-[#303030] p-6 text-sm leading-relaxed text-white/75">
              <h2 className="text-xl font-bold text-white">{dict.mypage.appFeatureTitle}</h2>
              <p className="mt-3">{dict.mypage.appFeatureBody}</p>
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
  actionLabel,
  emptyLabel,
}: {
  id: string
  title: string
  description: string
  items: string[]
  actionLabel: string
  emptyLabel: string
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
          {actionLabel}
        </button>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex min-h-12 items-center justify-between rounded-[8px] bg-[var(--color-bg-muted)] px-4 text-sm"
          >
            <span className="font-semibold">{item}</span>
            <span className="text-[var(--color-text-secondary)]">{emptyLabel}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
