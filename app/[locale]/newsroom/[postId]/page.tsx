import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { getNewsroomPost } from '@/lib/api/content'
import { newsroomCategories, type NewsroomContentBlock } from '@/lib/content/newsroom'
import { isLocale } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'
import { buildMetadata } from '@/lib/seo/metadata'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; postId: string }>
}) {
  const { locale, postId } = await params
  if (!isLocale(locale)) return {}
  const post = await getNewsroomPost(postId)
  if (!post) return {}
  return buildMetadata({
    title: `${post.title} - 바로도리 뉴스룸`,
    description: post.excerpt,
    path: `/${locale}/newsroom/${postId}`,
    locale,
    image: post.thumbnail,
  })
}

export default async function NewsroomDetailPage({
  params,
}: {
  params: Promise<{ locale: string; postId: string }>
}) {
  const { locale, postId } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  const post = await getNewsroomPost(postId)
  if (!post) notFound()
  const categoryLabel = newsroomCategories.find((item) => item.value === post.category)?.label ?? post.category
  const blocks = normalizeContentBlocks(post.content, post.excerpt)

  return (
    <Container className="py-12">
      <Link href={`/${loc}/newsroom`} className="text-sm font-semibold text-[var(--color-primary-dark)]">
        ← 뉴스룸으로 돌아가기
      </Link>

      <article className="mx-auto mt-8 max-w-3xl">
        <header className="border-b border-[var(--color-border)] pb-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-secondary)]">
            <span className="rounded-pill bg-[var(--color-primary-light)] px-3 py-1 font-semibold text-[var(--color-primary-dark)]">
              {categoryLabel}
            </span>
            {post.publishedAt && <time dateTime={post.publishedAt}>{post.publishedAt}</time>}
          </div>
          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">{post.title}</h1>
          <p className="mt-4 leading-relaxed text-[var(--color-text-secondary)]">{post.excerpt}</p>
        </header>

        {post.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.thumbnail}
            alt=""
            className="mt-8 max-h-[440px] w-full rounded-[8px] border border-[var(--color-border)] object-cover"
          />
        )}

        <div className="mt-8 space-y-5 leading-relaxed">
          {blocks.map((block, index) => (
            <NewsroomContentBlockView key={`${block.type ?? 'text'}-${index}`} block={block} title={post.title} />
          ))}
        </div>

        {post.href && (
          <div className="mt-10 rounded-[8px] bg-[var(--color-bg-muted)] p-5">
            <a
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-[8px] bg-[var(--color-text-primary)] px-5 text-sm font-bold text-white"
            >
              원문 보기 →
            </a>
          </div>
        )}
      </article>
    </Container>
  )
}

function NewsroomContentBlockView({ block, title }: { block: NewsroomContentBlock; title: string }) {
  const imageUrl = block.imageUrl ?? block.image_url ?? block.thumbnailUrl ?? block.thumbnail_url ?? block.url ?? block.src
  const text = (block.content ?? block.text ?? '').trim()
  if (imageUrl && (block.type === 'image' || !text)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={block.alt ?? title}
        className="max-h-[520px] w-full rounded-[8px] border border-[var(--color-border)] object-cover"
      />
    )
  }

  if (!text) return null

  return (
    <>
      {text.split(/\n{2,}/).map((paragraph, index) => {
        const trimmed = paragraph.trim()
        if (trimmed.startsWith('### ')) {
          return <h3 key={`${trimmed}-${index}`} className="pt-4 text-xl font-bold">{trimmed.replace(/^###\s+/, '')}</h3>
        }
        if (trimmed.startsWith('## ')) {
          return <h2 key={`${trimmed}-${index}`} className="pt-6 text-2xl font-bold">{trimmed.replace(/^##\s+/, '')}</h2>
        }
        return (
          <p key={`${trimmed}-${index}`} className="text-[var(--color-text-primary)]">
            {trimmed}
          </p>
        )
      })}
    </>
  )
}

function normalizeContentBlocks(
  content: NewsroomContentBlock[] | undefined,
  fallback: string,
): NewsroomContentBlock[] {
  if (content?.length) return content
  return [{ type: 'text', content: fallback }]
}
