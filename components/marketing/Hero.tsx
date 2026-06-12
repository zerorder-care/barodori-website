import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { StoreButtons } from '@/components/install/StoreButtons'
import { isAppLive } from '@/lib/install/storeLinks'
import { launchCopy } from '@/lib/site/config'
import type { Locale } from '@/lib/i18n/config'

export function Hero({ locale }: { locale: Locale }) {
  const live = isAppLive()
  const launchNotice = live ? launchCopy.liveNotice : '스토어 오픈 전까지 베타/알림 신청으로 먼저 소식을 받아보세요.'

  return (
    <section className="bg-[var(--color-bg-muted)] py-16 sm:py-20">
      <Container className="grid items-center gap-12 lg:grid-cols-[1fr_516px]">
        <div>
          <p className="inline-flex rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
            우리 아이 홈케어 운동 기록
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-[1.18] sm:text-5xl">
            오늘도 해냈다는
            <br />
            기록이 쌓이도록
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)]">
            집에서 한 운동, 물리치료 다녀온 날, 아이의 반응까지 한곳에 남겨요. 바로도리는 막막한 홈케어가 매일의 작은 루틴이 되도록 곁에서 도와드립니다.
          </p>
          <p className="mt-5 text-sm font-semibold text-[var(--color-primary-dark)]">일단 켜고, 오늘의 홈케어부터</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}/install`}
              className="inline-flex min-h-12 items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-6 text-sm font-bold text-[var(--color-text-primary)]"
            >
              앱에서 시작하기
            </Link>
            <Link
              href={`/${locale}/product`}
              className="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-[var(--color-text-primary)] bg-white px-6 text-sm font-bold text-[var(--color-text-primary)]"
            >
              기록 기능 둘러보기
            </Link>
          </div>
          <div className="mt-6">
            <StoreButtons surface="hero" locale={locale} />
          </div>
          <p className="mt-5 text-xs text-[var(--color-text-secondary)]">{launchNotice}</p>
        </div>
        <div className="relative grid min-h-[380px] place-items-center overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-white p-6 shadow-sm lg:min-h-[500px]">
          <div className="absolute inset-x-0 bottom-0 h-24 bg-[var(--color-primary-light)]" />
          <div className="relative aspect-[760/1500] w-full max-w-[300px]">
            <Image
              src="/images/hero-phone.png"
              alt="바로도리에서 오늘 홈케어 운동을 기록하고 리포트를 확인하는 앱 화면"
              fill
              sizes="(max-width: 640px) 70vw, 300px"
              className="object-contain drop-shadow-[0_24px_34px_rgba(0,0,0,0.18)]"
              priority
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
