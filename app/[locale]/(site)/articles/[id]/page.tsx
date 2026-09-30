import { notFound } from 'next/navigation'
import { getDictionary, isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Container } from '@/components/ui/Container'
import { ArticleViewTracker } from '@/components/article/ArticleViewTracker'
import { LabArticleHeader } from '@/components/article/LabArticleHeader'
import { LabDocument } from '@/components/article/LabDocument'
import { RelatedLabArticles } from '@/components/article/RelatedLabArticles'
import { Toc } from '@/components/article/Toc'
import { MedicalNotice } from '@/components/article/mdx/MedicalNotice'
import { InstallCta } from '@/components/marketing/InstallCta'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { getLabContent, listLabContents } from '@/lib/api/knowledgeLab'
import {
  toLabArticle,
  toLabArticleCard,
  type LabArticle,
  type LabArticleCard as LabArticleCardModel,
} from '@/lib/content/labArticle'
import { articleJsonLd, jsonLdScript } from '@/lib/seo/jsonLd'
import type { Locale } from '@/lib/i18n/config'

const RELATED_COUNT = 2

// 조회에 실패하면 빈 객체를 돌려 레이아웃 기본 메타데이터를 그대로 쓴다. 404가 아닌 실패는
// 아래 페이지 본체가 던져서 500으로 끝내므로, 여기서 같은 실패를 한 번 더 판정하지 않는다.
export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  if (!isLocale(locale)) return {}
  const { item } = await getLabContent({ locale, id })
  if (!item) return {}
  const article = toLabArticle(item, { collection: null, locale })
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/${locale}/articles/${id}`,
    locale,
    image: article.heroImage ?? undefined,
  })
}

async function loadRelated(article: LabArticle, locale: Locale): Promise<LabArticleCardModel[]> {
  if (article.category === 'monthly') {
    const { items } = await listLabContents({ locale, collection: 'home_monthly_information' })
    const neighbours = items
      .map((item) => toLabArticleCard(item, { collection: 'home_monthly_information', locale }))
      .filter((card) => card.id !== article.id)
      .filter((card) => article.track === 'both' || card.track === 'both' || card.track === article.track)
    const anchor = article.monthMin ?? 0
    return neighbours
      .sort((a, b) => Math.abs((a.monthMin ?? 0) - anchor) - Math.abs((b.monthMin ?? 0) - anchor))
      .slice(0, RELATED_COUNT)
  }

  const { items } = await listLabContents({ locale, collection: 'head_shape_lab', kind: article.kind })
  return items
    .map((item) => toLabArticleCard(item, { collection: 'head_shape_lab', locale }))
    .filter((card) => card.id !== article.id)
    .slice(0, RELATED_COUNT)
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  if (!isLocale(locale)) notFound()
  const loc: Locale = locale
  const { item, error } = await getLabContent({ locale: loc, id })
  if (!item) {
    // 404는 정말로 없는 글이다. 그 밖의 실패는 캐시에 빈 페이지가 굳지 않도록 던진다.
    if (error && error !== 'lab_api_http_404') throw new Error(error)
    notFound()
  }

  const article = toLabArticle(item, { collection: null, locale: loc })
  // 사전과 관련 글은 서로를 기다릴 이유가 없어 함께 읽는다.
  const [dict, related] = await Promise.all([getDictionary(loc), loadRelated(article, loc)])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            articleJsonLd({
              title: article.title,
              excerpt: article.excerpt,
              slug: article.id,
              locale: loc,
              author: dict.article.author,
              publishedAt: article.publishedAt,
              // 백엔드 웹 응답에 수정 시각이 없어 dateModified를 게시 시각과 같게 둔다.
              updatedAt: article.publishedAt,
              heroImage: article.heroImage,
            }),
          ),
        }}
      />
      <Container className="py-12">
        <article className="mx-auto max-w-3xl">
          <ArticleViewTracker slug={article.id} category={article.category} locale={loc} />
          <LabArticleHeader
            article={article}
            labels={{
              author: dict.article.author,
              readingTime: dict.article.readingTime,
              monthRange: dict.article.monthRange,
              monthRangeSpan: dict.article.monthRangeSpan,
              monthPlus: dict.article.monthPlus,
            }}
          />
          <Toc document={article.document} labels={{ tocTitle: dict.article.tocTitle }} />
          <LabDocument
            document={article.document}
            assets={article.assets}
            contentId={article.id}
            revisionId={article.revisionId}
            locale={loc}
            title={article.title}
            labels={{ attachment: dict.article.attachment, featureLink: dict.article.featureLink }}
          />
          <aside className="my-8 rounded-lg border border-[var(--color-primary)] bg-[var(--color-primary-light)] p-5 text-sm leading-relaxed">
            <p>
              {dict.article.detailCta}{' '}
              <TrackedLink
                href={`/${loc}/install`}
                event="cta_install_click"
                eventProps={{ surface: 'article_body', contentId: article.id, locale: loc, live: true }}
                className="font-semibold text-[var(--color-primary-dark)] underline"
              >
                {dict.article.detailCtaLink}
              </TrackedLink>
            </p>
          </aside>
          <MedicalNotice locale={loc} />
          <RelatedLabArticles
            cards={related}
            title={dict.article.relatedTitle}
            readingTimeLabel={dict.article.readingTime}
          />
        </article>
      </Container>
      <InstallCta locale={loc} surface={`article:${article.id}`} />
    </>
  )
}
