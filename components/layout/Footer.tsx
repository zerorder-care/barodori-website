import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { companyInfo, getExternalLinks } from '@/lib/site/config'

export async function Footer({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale)
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
          <Link href={`/${locale}`} className="inline-flex rounded-sm bg-white/12 px-4 py-2 text-sm font-bold text-white">
            {dict.common.appName}
          </Link>
          <p className="mt-3 max-w-xl leading-relaxed">{dict.footer.tagline}</p>
          <dl className="mt-6 grid gap-2 text-xs sm:grid-cols-2">
            <FooterInfo label="회사명" value={companyInfo.name} />
            <FooterInfo label="대표자" value={companyInfo.ceo} />
            <FooterInfo label="사업자등록번호" value={companyInfo.businessNumber} />
            <FooterInfo label="통신판매업신고번호" value={companyInfo.mailOrderNumber} />
            <FooterInfo label="이메일" value={companyInfo.email} />
            <FooterInfo label="주소" value={companyInfo.address} />
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
            문의는 카카오톡 채널로 남겨주세요.
            <br />
            {companyInfo.supportHours}
            <br />
            주말 및 공휴일 휴무
          </p>
          {links.kakaoChannel && (
            <a
              href={links.kakaoChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center rounded-pill bg-white px-5 py-3 text-sm font-bold text-black"
            >
              카카오톡 문의
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
