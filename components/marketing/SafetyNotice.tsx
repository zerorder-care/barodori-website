import { Container } from '@/components/ui/Container'
import { getDictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'

export async function SafetyNotice({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale)
  return (
    <section className="py-10">
      <Container>
        <aside
          role="note"
          className="rounded-[8px] border border-dashed border-[var(--color-border)] bg-white p-5 text-center"
          aria-label={dict.medical.title}
        >
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">{dict.medical.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{dict.medical.body}</p>
        </aside>
      </Container>
    </section>
  )
}
