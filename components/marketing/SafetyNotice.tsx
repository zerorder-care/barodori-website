import { Container } from '@/components/ui/Container'
import { getDictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'

export async function SafetyNotice({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale)
  return (
    <section className="py-12">
      <Container>
        <aside
          role="note"
          className="rounded-lg border border-[--color-danger] bg-red-50 p-5"
          aria-label={dict.medical.title}
        >
          <p className="font-semibold text-[--color-danger]">{dict.medical.title}</p>
          <p className="mt-2 text-sm leading-relaxed">{dict.medical.body}</p>
        </aside>
      </Container>
    </section>
  )
}
