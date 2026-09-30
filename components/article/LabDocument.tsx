import type { ReactNode } from 'react'
import ReactMarkdown, { defaultUrlTransform, type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { LabCallout } from '@/components/article/LabCallout'
import { labAssetUrl, type LabAsset, type LabRenderNode } from '@/lib/api/knowledgeLab'
import type { Locale } from '@/lib/i18n/config'

export type LabDocumentLabels = {
  attachment: string
  featureLink: string
}

type LabDocumentProps = {
  document: LabRenderNode[]
  assets: LabAsset[]
  contentId: string
  revisionId: string
  locale: Locale
  title: string
  labels: LabDocumentLabels
}

const LAB_ASSET_SCHEME = 'lab-asset:'

/**
 * 앱 기능 버튼 후보를 가려내는 어미 목록이다. 사용자에게 보이는 카피가 아니라 원고 인라인 코드를
 * 분류하는 판별 토큰이므로 사전에 두지 않는다.
 */
const FEATURE_LINK_SUFFIXES = [
  '시작하기', // i18n:allow-hardcoded-copy
  '하러가기', // i18n:allow-hardcoded-copy
  '알아보기', // i18n:allow-hardcoded-copy
  '찾아보기', // i18n:allow-hardcoded-copy
  '찾기', // i18n:allow-hardcoded-copy
  '보기', // i18n:allow-hardcoded-copy
  '세팅하기', // i18n:allow-hardcoded-copy
  '기록하기', // i18n:allow-hardcoded-copy
]

export function isFeatureLinkText(text: string): boolean {
  const trimmed = text.trim()
  return FEATURE_LINK_SUFFIXES.some((suffix) => trimmed.endsWith(suffix))
}

/**
 * react-markdown의 기본 정화기는 아는 스킴만 남기고 나머지 URL을 지운다. lab-asset은 백엔드 자산을
 * 가리키는 내부 스킴이라 그대로 통과시키고, 나머지 주소는 기본 규칙을 그대로 따른다.
 */
function labUrlTransform(url: string): string {
  return url.startsWith(LAB_ASSET_SCHEME) ? url : defaultUrlTransform(url)
}

function labAssetIdFrom(value: string | undefined): string | null {
  if (!value || !value.startsWith(LAB_ASSET_SCHEME)) return null
  const id = value.slice(LAB_ASSET_SCHEME.length).trim()
  return id.length > 0 ? id : null
}

function toPlainText(node: ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(toPlainText).join('')
  return ''
}

function buildComponents(props: LabDocumentProps): Components {
  const { assets, contentId, revisionId, locale, title, labels } = props

  const assetHref = (assetVersionId: string) =>
    labAssetUrl({ contentId, revisionId, assetVersionId, locale })

  return {
    // 상세 페이지의 h1은 본제목 하나뿐이므로 본문의 #는 ##로 올린다.
    // 제목이 가진 속성 중 목차가 쓰는 것은 rehype-slug가 붙인 id뿐이라 id만 넘긴다.
    // props를 통째로 펼치면 react-markdown이 함께 넘기는 hast 노드가 DOM으로 새어 나간다.
    h1: ({ children, id }) => (
      <h2 id={id} className="mt-12 mb-3 text-2xl font-bold tracking-tight">
        {children}
      </h2>
    ),
    h2: ({ children, id }) => (
      <h2 id={id} className="mt-12 mb-3 text-2xl font-bold tracking-tight">
        {children}
      </h2>
    ),
    h3: ({ children, id }) => (
      <h3 id={id} className="mt-8 mb-2 text-lg font-semibold tracking-tight">
        {children}
      </h3>
    ),
    h4: ({ children, id }) => (
      <h4 id={id} className="mt-6 mb-2 text-base font-semibold">
        {children}
      </h4>
    ),
    p: ({ children }) => <p className="my-5 leading-[1.9] text-[var(--color-text-primary)]">{children}</p>,
    ul: ({ children }) => (
      <ul className="my-5 ml-5 list-disc space-y-1.5 leading-[1.85] marker:text-[var(--color-primary)]">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="my-5 ml-5 list-decimal space-y-1.5 leading-[1.85] marker:text-[var(--color-text-secondary)]">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-1">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="my-4 border-l-4 border-[var(--color-border)] pl-4 text-[var(--color-text-secondary)]">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-10 border-[var(--color-border)]" />,
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-3 py-2 text-left font-semibold">
        {children}
      </th>
    ),
    td: ({ children }) => <td className="border border-[var(--color-border)] px-3 py-2 align-top">{children}</td>,
    img: ({ src, alt }) => {
      const raw = typeof src === 'string' ? src : undefined
      const assetId = labAssetIdFrom(raw)
      const resolved = assetId ? assetHref(assetId) : (raw ?? '')
      if (!resolved) return null
      return (
        // 앱 자산의 크기를 알 수 없어 next/image의 고정 폭 방식을 쓰지 않는다.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolved}
          alt={alt && alt.trim().length > 0 ? alt : title}
          loading="lazy"
          className="my-6 block h-auto w-full rounded-lg border border-[var(--color-border)]"
        />
      )
    },
    a: ({ href, children }) => {
      const assetId = labAssetIdFrom(href)
      if (assetId) {
        const asset = assets.find((item) => item.assetVersionId === assetId)
        return (
          <a
            href={assetHref(assetId)}
            className="my-4 inline-flex flex-wrap items-center gap-2 rounded-[8px] border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)]"
          >
            <span>{children}</span>
            <span className="text-xs font-normal text-[var(--color-text-secondary)]">
              {asset ? `${labels.attachment}, ${asset.filename}` : labels.attachment}
            </span>
          </a>
        )
      }
      if (href?.startsWith('https://')) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--color-primary-dark)] underline"
          >
            {children}
          </a>
        )
      }
      return (
        <a href={href} className="font-medium text-[var(--color-primary-dark)] underline">
          {children}
        </a>
      )
    },
    // react-markdown 10에는 inline 플래그가 없다. 펜스 코드 블록만 className을 받으므로
    // pre를 풀고 code에서 갈라 쓴다. 언어 표시가 없는 펜스 블록은 인라인으로 취급된다.
    pre: ({ children }) => <>{children}</>,
    code: ({ className, children }) => {
      if (className) {
        return (
          <pre className="my-6 overflow-x-auto rounded-lg bg-[var(--color-bg-muted)] p-4 text-sm">
            <code className={className}>{children}</code>
          </pre>
        )
      }
      const text = toPlainText(children)
      if (isFeatureLinkText(text)) {
        return (
          <TrackedLink
            href={`/${locale}/install`}
            event="cta_install_click"
            eventProps={{ surface: 'article_feature_link', contentId, locale, live: true }}
            className="mx-0.5 inline-flex items-center gap-2 rounded-[8px] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-bold text-[var(--color-text-primary)]"
          >
            <span>{text}</span>
            <span className="text-xs font-normal text-[var(--color-text-secondary)]">{labels.featureLink}</span>
          </TrackedLink>
        )
      }
      return (
        <code className="rounded bg-[var(--color-bg-muted)] px-1.5 py-0.5 text-[0.95em]">{children}</code>
      )
    },
  }
}

function renderNodes(nodes: LabRenderNode[], props: LabDocumentProps, keyPrefix: string): ReactNode[] {
  const components = buildComponents(props)
  return nodes.map((node, index) => {
    const key = `${keyPrefix}${node.type}-${index}`
    if (node.type === 'markdown') {
      return (
        <ReactMarkdown
          key={key}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug]}
          urlTransform={labUrlTransform}
          components={components}
        >
          {node.markdown}
        </ReactMarkdown>
      )
    }
    if (node.type === 'callout') {
      return (
        <LabCallout key={key} icon={node.icon}>
          {renderNodes(node.children, props, `${key}-`)}
        </LabCallout>
      )
    }
    return (
      <details key={key} className="my-6 rounded-lg border border-[var(--color-border)] px-4 py-3">
        <summary className="cursor-pointer font-semibold">{node.title}</summary>
        <div className="mt-2">{renderNodes(node.children, props, `${key}-`)}</div>
      </details>
    )
  })
}

export function LabDocument(props: LabDocumentProps) {
  return <div className="text-[15px] sm:text-base">{renderNodes(props.document, props, '')}</div>
}
