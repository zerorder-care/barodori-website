import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'

export async function MedicalNotice({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale)
  return (
    <aside
      role="note"
      aria-label={dict.medical.title}
      className="my-8 rounded-lg border border-[var(--color-danger)] bg-red-50 p-5"
    >
      <p className="font-semibold text-[var(--color-danger)]">{dict.medical.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-primary)]">
        {dict.medical.body}
      </p>
    </aside>
  )
}
