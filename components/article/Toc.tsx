import GithubSlugger from 'github-slugger'
import type { LabRenderNode } from '@/lib/api/knowledgeLab'
import { stripMarkdown } from '@/lib/content/labArticle'

export type TocHeading = {
  level: 2 | 3
  text: string
  id: string
}

const HEADING_PATTERN = /^(#{1,6})\s+(.+)$/
const FENCE_PATTERN = /^(```|~~~)/

/**
 * 렌더 문서에서 목차 항목을 모은다. 접기 노드 안의 제목은 넣지 않는다.
 * id는 본문과 같은 github-slugger 규칙으로 만들고, rehype-slug가 ReactMarkdown 실행마다
 * 새 슬러거를 쓰므로 목차도 마크다운 노드마다 슬러거를 새로 만든다.
 */
export function collectHeadings(document: LabRenderNode[]): TocHeading[] {
  const headings: TocHeading[] = []

  const walk = (nodes: LabRenderNode[]) => {
    for (const node of nodes) {
      if (node.type === 'disclosure') continue
      if (node.type === 'callout') {
        walk(node.children)
        continue
      }

      const slugger = new GithubSlugger()
      let insideFence = false
      for (const rawLine of node.markdown.split('\n')) {
        const line = rawLine.trim()
        if (FENCE_PATTERN.test(line)) {
          insideFence = !insideFence
          continue
        }
        if (insideFence) continue

        const matched = HEADING_PATTERN.exec(line)
        if (!matched) continue
        const text = stripMarkdown(matched[2])
        if (text.length === 0) continue

        // 모든 제목을 슬러거에 통과시켜야 중복 번호가 본문과 같아진다.
        const id = slugger.slug(text)
        // 렌더러가 #를 ##로 올리므로 목차도 같은 단계로 본다.
        const level = matched[1].length === 1 ? 2 : matched[1].length
        if (level !== 2 && level !== 3) continue
        headings.push({ level, text, id })
      }
    }
  }

  walk(document)
  return headings
}

export function Toc({
  document,
  labels,
}: {
  document: LabRenderNode[]
  labels: { tocTitle: string }
}) {
  const headings = collectHeadings(document)
  if (headings.length < 2) return null

  return (
    <nav aria-label={labels.tocTitle} className="mb-8 rounded-lg bg-[var(--color-bg-muted)] p-4 text-sm">
      <p className="font-semibold">{labels.tocTitle}</p>
      <ul className="mt-2 space-y-1">
        {headings.map((heading) => (
          <li key={`${heading.level}-${heading.id}`} className={heading.level === 3 ? 'ml-4' : ''}>
            <a
              href={`#${heading.id}`}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
