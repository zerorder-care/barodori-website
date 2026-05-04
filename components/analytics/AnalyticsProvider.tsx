'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { track } from '@/lib/analytics'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const AMP_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_KEY

export function AnalyticsProvider() {
  const pathname = usePathname()

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
      {AMP_KEY && (
        <Script id="amplitude-init" strategy="afterInteractive">
          {`!(function(){var e=window.amplitude||{_q:[],_iq:{}};e.invoked=true;e._q=[];window.amplitude=e;})();
          import('https://cdn.amplitude.com/libs/analytics-browser-2.11.0-min.js.gz').then(function(m){
            var a = m.default || m;
            a.init('${AMP_KEY}', undefined, { defaultTracking: { sessions: true, pageViews: false } });
            window.amplitude = a;
          }).catch(function(){});`}
        </Script>
      )}
    </>
  )
}
