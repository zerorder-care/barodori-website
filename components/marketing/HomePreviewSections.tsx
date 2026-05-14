import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { expertRecommendations, parentReviews } from '@/lib/content/reviews'
import type { CommunityPost } from '@/lib/content/community'
import type { NewsroomPost } from '@/lib/content/newsroom'
import type { Locale } from '@/lib/i18n/config'

export function HomePreviewSections({
  locale,
  communityPosts,
  newsroomPosts,
}: {
  locale: Locale
  communityPosts: CommunityPost[]
  newsroomPosts: NewsroomPost[]
}) {
  return (
    <>
      <section className="bg-[var(--color-bg-muted)] py-24">
        <Container>
          <SectionHeader
            eyebrow="사용자 후기 하이라이트"
            title="실제 보호자들의 진솔한 이야기"
            description="바로도리와 함께 회복을 시작한 가족들의 후기를 만나보세요"
            href={`/${locale}/reviews`}
            linkLabel="더 많은 후기 보기"
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {parentReviews.slice(0, 3).map((review) => (
              <article key={review.id} className="min-h-64 rounded-[8px] border border-[var(--color-border)] bg-white p-7">
                <p className="text-xs font-semibold text-[var(--color-text-secondary)]">{review.babyAge}</p>
                <p className="mt-5 text-lg tracking-[0.12em]">★★★★★</p>
                <h3 className="mt-4 text-lg font-bold leading-snug">“{review.title}”</h3>
                <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">{review.body}</p>
                <div className="mt-8 flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                  <span>{review.duration}</span>
                  <time dateTime={review.writtenAt}>{review.writtenAt}</time>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-24">
        <Container>
          <SectionHeader
            eyebrow="전문가 추천 · 차별점"
            title="전문 의료진과 함께 만들었습니다"
            description="실제 보호자 경험과 의료진의 전문성이 만나 만든 가정 재활 보조 서비스예요"
          />
          <div className="mt-10 rounded-[12px] border border-[var(--color-border)] bg-[#f7f7f7] p-10">
            <div className="grid gap-8 lg:grid-cols-[160px_1fr] lg:items-center">
              <div className="grid h-32 w-32 place-items-center rounded-full border border-dashed border-[#b9b9b9] bg-[#e7e7e7] text-center text-xs text-[var(--color-text-secondary)]">
                의료진
                <br />
                프로필 사진
              </div>
              <div>
                <p className="text-4xl font-bold text-[#b9b9b9]">“</p>
                <p className="mt-2 max-w-3xl leading-relaxed">
                  {expertRecommendations[0]?.quote ??
                    '영유아 사경 · 사두는 조기 발견과 꾸준한 가정 재활이 무엇보다 중요합니다.'}
                </p>
                <p className="mt-5 text-sm font-bold">
                  {expertRecommendations[0]?.name ?? '서지현 교수'}
                  <span className="ml-3 font-medium text-[var(--color-text-secondary)]">
                    {expertRecommendations[0]?.organization ?? '분당서울대학교병원 재활의학과'}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {[
              ['실제 보호자 경험 기반', '대표의 자녀 사경 경험에서 출발해 보호자 관점의 기능을 담았어요'],
              ['전문 의료진 협업', '분당서울대학교병원 재활의학과 서지현 교수와의 임상 협업으로 신뢰성을 확보했어요'],
              ['AI 기반 객관적 측정', '사진 한 장으로 기울기와 가동범위, 두상을 수치화해 변화를 객관적으로 추적해요'],
            ].map(([title, body], index) => (
              <article key={title} className="rounded-[8px] border border-[var(--color-border)] bg-white p-7">
                <p className="text-2xl font-bold text-[#a5a5a5]">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[var(--color-bg-muted)] py-24">
        <Container>
          <SectionHeader
            eyebrow="커뮤니티 미리보기"
            title="보호자들의 살아 있는 이야기"
            description="소통방 · 질문방에서 매일 새로운 이야기가 이어지고 있어요"
            href={`/${locale}/community`}
            linkLabel="커뮤니티 더 보기"
          />
          {communityPosts.length > 0 ? (
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {communityPosts.slice(0, 3).map((post) => (
                <Link
                  key={post.id}
                  href={`/${locale}/community/${post.id}`}
                  className="min-h-56 rounded-[8px] border border-[var(--color-border)] bg-white p-7 transition hover:shadow-md"
                >
                  <p className="inline-flex rounded-[4px] bg-[#efefef] px-2 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                    {post.author}
                  </p>
                  <h3 className="mt-4 text-lg font-bold">{post.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{post.preview}</p>
                  <p className="mt-8 text-xs font-semibold text-[var(--color-text-secondary)]">
                    ♥ {post.likeCount} · 댓글 {post.commentCount}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-10 rounded-[8px] border border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-text-secondary)]">
              커뮤니티 게시글을 준비하고 있습니다.
            </p>
          )}
        </Container>
      </section>

      <section className="bg-white py-24">
        <Container>
          <SectionHeader
            eyebrow="뉴스룸 미리보기"
            title="바로도리의 새로운 소식"
            description="서비스 업데이트와 보도자료, 제휴 소식을 가장 먼저 만나보세요"
            href={`/${locale}/newsroom`}
            linkLabel="뉴스룸 더 보기"
          />
          {newsroomPosts.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {newsroomPosts.slice(0, 3).map((post) => (
                <NewsroomPreviewCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="mt-10 rounded-[8px] border border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-text-secondary)]">
              뉴스룸 소식을 준비하고 있습니다.
            </p>
          )}
        </Container>
      </section>
    </>
  )
}

function NewsroomPreviewCard({ post }: { post: NewsroomPost }) {
  const content = (
    <>
      {post.thumbnail ? (
        <div
          aria-hidden="true"
          className="aspect-[16/9] w-full border-b border-[var(--color-border)] bg-cover bg-center"
          style={{ backgroundImage: `url(${JSON.stringify(post.thumbnail)})` }}
        />
      ) : (
        <div className="grid aspect-[16/9] place-items-center border-b border-dashed border-[#b9b9b9] bg-[#e6e6e6] text-xs text-[var(--color-text-secondary)]">
          대표 이미지
        </div>
      )}
      <div className="p-6">
        {post.publishedAt && <p className="text-xs text-[var(--color-text-secondary)]">{post.publishedAt}</p>}
        <h3 className="mt-3 text-lg font-bold leading-snug">{post.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{post.excerpt}</p>
      </div>
    </>
  )

  if (post.href) {
    return (
      <a href={post.href} target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded-[8px] border border-[var(--color-border)] bg-white">
        {content}
      </a>
    )
  }

  return <article className="overflow-hidden rounded-[8px] border border-[var(--color-border)] bg-white">{content}</article>
}

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  eyebrow: string
  title: string
  description?: string
  href?: string
  linkLabel?: string
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">{eyebrow}</p>
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{title}</h2>
        {description && <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{description}</p>}
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="inline-flex min-h-11 items-center rounded-[8px] border border-[var(--color-text-primary)] px-5 text-sm font-bold"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  )
}
