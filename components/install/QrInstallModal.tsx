'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { isAppLive, getBetaFormUrl } from '@/lib/install/storeLinks'
import { track } from '@/lib/analytics'
import type { Locale } from '@/lib/i18n/config'

type Props = {
  surface: string
  locale: Locale
  copy: {
    installGuide: string
    qrInstallTitle: string
    qrInstallBody: string
    qrPlaceholder: string
    openingSoonTitle: string
    openingSoonBody: string
    pendingCta: string
    close: string
  }
  children: React.ReactNode
}

export function QrInstallModal({ surface, locale, copy, children }: Props) {
  const [open, setOpen] = useState(false)
  const live = isAppLive()
  const beta = getBetaFormUrl()

  const onTriggerClick = () => {
    track('cta_install_click', { surface, platform: 'qr', locale, live })
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={onTriggerClick}
        className="inline-flex items-center justify-center rounded-pill bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-text-primary)]"
      >
        {children}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} ariaLabel={copy.installGuide} closeLabel={copy.close}>
        {live ? (
          <div>
            <h2 className="text-lg font-semibold">{copy.qrInstallTitle}</h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {copy.qrInstallBody}
            </p>
            <div className="mx-auto mt-4 grid h-40 w-40 place-items-center rounded-lg border border-dashed border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
              {copy.qrPlaceholder}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold">{copy.openingSoonTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {copy.openingSoonBody}
            </p>
            {beta && (
              <a
                href={beta}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('cta_beta_form_click', { surface: `${surface}:modal`, locale })}
                className="mt-4 inline-flex w-full items-center justify-center rounded-pill bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-text-primary)]"
              >
                {copy.pendingCta}
              </a>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
