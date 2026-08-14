'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { flushAmplitude, track } from '@/lib/analytics'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const AMP_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_KEY

export function AnalyticsProvider() {
  const pathname = usePathname()

  // 앰플리튜드는 공식 npm SDK를 lazy 로드해 초기화한다.
  // 자동 수집은 세션·유입 어트리뷰션만 켜고, page_view는 우리 이벤트로 직접 남긴다.
  useEffect(() => {
    if (!AMP_KEY || window.amplitude) return
    import('@amplitude/analytics-browser')
      .then((amplitude) => {
        amplitude.init(AMP_KEY, {
          autocapture: {
            attribution: true,
            sessions: true,
            pageViews: false,
            formInteractions: false,
            fileDownloads: false,
            elementInteractions: false,
          },
        })
        window.amplitude = amplitude
        flushAmplitude()
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!pathname) return
    track('page_view', { path: pathname })
  }, [pathname])

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { anonymize_ip: true, send_page_view: false });`}
          </Script>
        </>
      )}
    </>
  )
}
