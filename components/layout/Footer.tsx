import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { getExternalLinks } from '@/lib/site/config'

export async function Footer({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale)
  const companyInfo = dict.footer.companyValues
  const year = new Date().getFullYear()
  const links = getExternalLinks()
  const sns = [
    { label: 'Instagram', href: links.instagram },
    { label: 'Blog', href: links.naverBlog },
    { label: 'YouTube', href: links.youtube },
  ].filter((item): item is { label: string; href: string } => Boolean(item.href))

  return (
    <footer className="border-t border-white/10 bg-[#171717] py-14 text-sm text-white/60">
      <Container className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <dl className="mt-6 grid gap-2 text-xs sm:grid-cols-2">
            <FooterInfo label={dict.footer.companyName} value={companyInfo.name} />
            <FooterInfo label={dict.footer.ceo} value={companyInfo.ceo} />
            <FooterInfo label={dict.footer.businessNumber} value={companyInfo.businessNumber} />
            <FooterInfo label={dict.footer.mailOrderNumber} value={companyInfo.mailOrderNumber} />
            <FooterInfo label={dict.footer.email} value={companyInfo.email} />
            <FooterInfo label={dict.footer.address} value={companyInfo.address} />
          </dl>
          <nav className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-white/80">
            <Link href={`/${locale}/legal/privacy`}>{dict.footer.privacy}</Link>
            <Link href={`/${locale}/legal/terms`}>{dict.footer.terms}</Link>
            {links.businessInfo ? (
              <a href={links.businessInfo} target="_blank" rel="noopener noreferrer">
                {dict.footer.businessInfo}
              </a>
            ) : (
              <span>{dict.footer.businessInfo}</span>
            )}
          </nav>
          <p className="mt-6 text-xs">{dict.footer.copyright.replace('{year}', String(year))}</p>
        </div>
        <div>
          <h2 className="text-base font-bold text-white">{dict.footer.support}</h2>
          <p className="mt-3 leading-relaxed">
            {dict.footer.supportBody
              .replace('{supportHours}', dict.footer.supportHours)
              .split('\n')
              .map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
          </p>
          {links.kakaoChannel && (
            <a
              href={links.kakaoChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center rounded-pill bg-white px-5 py-3 text-sm font-bold text-black"
            >
              {dict.footer.kakaoInquiry}
            </a>
          )}
          {sns.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {sns.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/14 text-[10px] font-semibold text-white"
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </Container>
      <Container>
        <p className="mt-10 border-t border-white/10 pt-5 text-xs leading-relaxed text-white/45">
          {dict.footer.medicalDisclaimer}
        </p>
      </Container>
    </footer>
  )
}

function FooterInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 font-semibold text-white/80">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
