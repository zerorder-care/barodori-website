import { Container } from '@/components/ui/Container'
import { StoreButtons } from '@/components/install/StoreButtons'
import type { Locale } from '@/lib/i18n/config'

export function InstallCta({ locale, surface }: { locale: Locale; surface: string }) {
  return (
    <section className="bg-[#303030] py-24 text-white">
      <Container className="flex flex-col items-center text-center">
        <p className="rounded-pill bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">하단 다운로드 영역</p>
        <h2 className="mt-8 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
          지금 바로도리에서
          <br />
          우리 아이의 회복을 시작해보세요
        </h2>
        <p className="mt-5 text-sm text-white/70">전문 의료진과 함께 만든 가정 재활 보조 앱, 바로도리에서 만나보세요</p>
        <div className="mt-8">
          <StoreButtons surface={surface} locale={locale} />
        </div>
        <p className="mt-6 text-xs text-white/50">* 현재 베타 운영중 · 정식 출시 2026.5.20 예정</p>
      </Container>
    </section>
  )
}
