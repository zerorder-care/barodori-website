import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { communityCategories, communityPosts, getCommunityPost } from '@/lib/content/community'
import { isLocale } from '@/lib/i18n/dictionary'
import { locales, type Locale } from '@/lib/i18n/config'
import { buildMetadata } from '@/lib/seo/metadata'

export async function generateStaticParams() {
  return locales.flatMap((locale) => communityPosts.map((post) => ({ locale, postId: post.id })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; postId: string }>
}) {
  const { locale, postId } = await params
  if (!isLocale(locale)) return {}
  const post = getCommunityPost(postId)
  if (!post) return {}
  return buildMetadata({
    title: `${post.title} - 바로도리 커뮤니티`,
    description: post.preview,
    path: `/${locale}/community/${postId}`,
    locale,
  })
}

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; postId: string }>
}) {
  const { locale, postId } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  const post = getCommunityPost(postId)
  if (!post) notFound()
  const category = communityCategories.find((item) => item.value === post.category)?.label

  return (
    <Container className="py-12">
      <Link href={`/${loc}/community`} className="text-sm font-semibold text-[var(--color-primary-dark)]">
        ← 목록으로 돌아가기
      </Link>
      <article className="mx-auto mt-8 max-w-3xl">
        <div className="border-b border-[var(--color-border)] pb-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <span className="rounded-pill bg-[var(--color-primary-light)] px-3 py-1 font-semibold text-[var(--color-primary-dark)]">
              {category}
            </span>
            <span>{post.author} · 아이 {post.babyAge}</span>
            <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</time>
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight">{post.title}</h1>
          <div className="mt-4 flex gap-4 text-sm font-semibold text-[var(--color-text-secondary)]">
            <span>마음 {post.likeCount}</span>
            <span>댓글 {post.commentCount}</span>
          </div>
        </div>

        <div className="mt-8 space-y-4 leading-relaxed text-[var(--color-text-primary)]">
          {post.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-pill bg-[var(--color-bg-muted)] px-5 py-3 text-sm font-semibold text-[var(--color-text-secondary)]"
          >
            마음은 앱에서 가능
          </button>
          <button
            type="button"
            className="rounded-pill border border-[var(--color-border)] px-5 py-3 text-sm font-semibold"
          >
            링크 복사
          </button>
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-bold">댓글 {post.comments.length}</h2>
          {post.comments.length === 0 ? (
            <p className="mt-4 rounded-lg border border-[var(--color-border)] p-6 text-center text-[var(--color-text-secondary)]">
              첫 댓글을 남겨보세요. 댓글 작성은 앱에서 가능합니다.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)] bg-white">
              {post.comments.map((comment) => (
                <article key={comment.id} className="p-5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <p className="font-semibold">{comment.author}</p>
                    <time className="text-xs text-[var(--color-text-secondary)]" dateTime={comment.createdAt}>
                      {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                    </time>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{comment.content}</p>
                  <p className="mt-3 text-xs font-semibold text-[var(--color-text-secondary)]">마음 {comment.likeCount}</p>
                </article>
              ))}
            </div>
          )}
          <div className="mt-6 rounded-lg bg-[var(--color-primary-light)] p-5 text-sm leading-relaxed">
            댓글 작성과 마음 누르기는 바로도리 앱에서 이용할 수 있습니다.
          </div>
        </section>
      </article>
    </Container>
  )
}

