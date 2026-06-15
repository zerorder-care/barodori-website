import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Container } from '@/components/ui/Container'
import { ArticleHeader } from '@/components/article/ArticleHeader'
import { ArticleViewTracker } from '@/components/article/ArticleViewTracker'
import { Toc } from '@/components/article/Toc'
import { RelatedArticles } from '@/components/article/RelatedArticles'
import { MedicalNotice } from '@/components/article/mdx/MedicalNotice'
import { InstallCta } from '@/components/marketing/InstallCta'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { getArticlePost, getRelatedArticlePosts } from '@/lib/api/articles'
import { listAllSlugs } from '@/lib/content/articles'
import { getMDXComponents } from '@/mdx-components'
import { articleJsonLd, jsonLdScript } from '@/lib/seo/jsonLd'
import type { Locale } from '@/lib/i18n/config'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return listAllSlugs()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const article = await getArticlePost({ locale, slug })
  if (!article) return {}
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/${locale}/articles/${slug}`,
    locale,
    image: article.ogImage ?? article.heroImage,
  })
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  const article = await getArticlePost({ locale: loc, slug })
  if (!article) notFound()
  const related = await getRelatedArticlePosts(article)
  const mdxComponents = getMDXComponents({})

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            articleJsonLd({
              title: article.title,
              excerpt: article.excerpt,
              slug: article.slug,
              locale: article.locale,
              author: article.author,
              publishedAt: article.publishedAt,
              updatedAt: article.updatedAt,
              heroImage: article.heroImage,
            }),
          ),
        }}
      />
      <Container className="py-12">
        <article className="mx-auto max-w-3xl">
          <ArticleViewTracker slug={article.slug} category={article.category} locale={loc} />
          <ArticleHeader article={article} />
          <Toc markdown={article.body} />
          <div className="prose prose-neutral max-w-none">
            <MDXRemote
              source={article.body}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeSlug],
                },
              }}
            />
          </div>
          <aside className="my-8 rounded-lg border border-[var(--color-primary)] bg-[var(--color-primary-light)] p-5 text-sm leading-relaxed">
            <p>
              바로도리 앱은 이 글에서 다룬 관찰 내용을 기록으로 남기고, 상담 전 참고 자료로 정리할 수 있게 도와요.{' '}
              <TrackedLink
                href={`/${loc}#home-features`}
                event="article_to_home_features_click"
                eventProps={{ slug: article.slug, locale: loc }}
                className="font-semibold text-[var(--color-primary-dark)] underline"
              >
                기능 흐름 보기 →
              </TrackedLink>
            </p>
          </aside>
          <MedicalNotice locale={loc} />
          <RelatedArticles articles={related} />
        </article>
      </Container>
      <InstallCta locale={loc} surface={`article:${slug}`} />
    </>
  )
}
