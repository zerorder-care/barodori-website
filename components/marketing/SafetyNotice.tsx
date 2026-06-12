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
          className="rounded-[8px] border border-[#FDE68A] bg-[#FFFBEB] p-6"
          aria-label={dict.medical.title}
        >
          <p className="text-xs font-semibold text-[var(--color-primary-dark)]">{dict.medical.title}</p>
          <div className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            <p>{dict.medical.body}</p>
            <p>{dict.medical.emergency}</p>
            <p>{dict.medical.stress}</p>
          </div>
        </aside>
      </Container>
    </section>
  )
}
