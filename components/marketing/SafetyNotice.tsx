import { Container } from '@/components/ui/Container'
import { getDictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'

export async function SafetyNotice({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const dict = await getDictionary(locale)
  const copy = compact
    ? [dict.medical.compactBody]
    : [dict.medical.body, dict.medical.emergency, dict.medical.stress]

  return (
    <section className={compact ? 'bg-[var(--color-bg-muted)] py-12' : 'py-10'}>
      <Container>
        <aside
          role="note"
          className="rounded-[8px] border border-[#FDE68A] bg-[#FFFBEB] p-6"
          aria-label={dict.medical.title}
        >
          <p className="text-xs font-semibold text-[var(--color-primary-dark)]">{dict.medical.title}</p>
          <div className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {copy.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </aside>
      </Container>
    </section>
  )
}
