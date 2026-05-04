import { Container } from '@/components/ui/Container'
import { QrInstallModal } from '@/components/install/QrInstallModal'
import { StoreButtons } from '@/components/install/StoreButtons'
import type { Locale } from '@/lib/i18n/config'

export function InstallCta({ locale, surface }: { locale: Locale; surface: string }) {
  return (
    <section className="bg-[--color-primary] py-12 text-black">
      <Container className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">우리 아기 두상, 오늘부터 바로도리와 함께</h2>
        <div className="hidden sm:block">
          <QrInstallModal surface={surface} locale={locale}>지금 설치하기</QrInstallModal>
        </div>
        <div className="sm:hidden">
          <StoreButtons surface={surface} locale={locale} />
        </div>
      </Container>
    </section>
  )
}
