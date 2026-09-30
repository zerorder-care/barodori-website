import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { LabRenderNode } from '@/lib/api/knowledgeLab'
import { Toc, collectHeadings } from './Toc'

const labels = { tocTitle: '목차' }

describe('collectHeadings', () => {
  it('collects level two and three headings in document order', () => {
    const document: LabRenderNode[] = [
      { type: 'markdown', markdown: '# 큰 제목\n\n본문\n\n## 준비물\n\n### 수건\n\n#### 너무 깊은 제목' },
    ]
    expect(collectHeadings(document)).toEqual([
      { level: 2, text: '큰 제목', id: '큰-제목' },
      { level: 2, text: '준비물', id: '준비물' },
      { level: 3, text: '수건', id: '수건' },
    ])
  })

  it('skips headings inside a disclosure node', () => {
    const document: LabRenderNode[] = [
      { type: 'markdown', markdown: '## 겉 제목' },
      { type: 'disclosure', title: '접기', children: [{ type: 'markdown', markdown: '## 접힌 제목' }] },
    ]
    expect(collectHeadings(document).map((heading) => heading.text)).toEqual(['겉 제목'])
  })

  it('collects headings inside a callout node', () => {
    const document: LabRenderNode[] = [
      { type: 'callout', icon: null, children: [{ type: 'markdown', markdown: '## 콜아웃 제목' }] },
    ]
    expect(collectHeadings(document).map((heading) => heading.text)).toEqual(['콜아웃 제목'])
  })

  it('ignores hash lines inside a fenced code block', () => {
    const document: LabRenderNode[] = [
      { type: 'markdown', markdown: '## 진짜 제목\n\n```bash\n## 주석입니다\n```' },
    ]
    expect(collectHeadings(document).map((heading) => heading.text)).toEqual(['진짜 제목'])
  })

  it('strips inline markdown from the heading text', () => {
    const document: LabRenderNode[] = [{ type: 'markdown', markdown: '## **굵은** 제목' }]
    expect(collectHeadings(document)[0]).toEqual({ level: 2, text: '굵은 제목', id: '굵은-제목' })
  })

  it('numbers duplicate headings the same way rehype-slug does inside one markdown node', () => {
    const document: LabRenderNode[] = [{ type: 'markdown', markdown: '## 순서\n\n## 순서' }]
    expect(collectHeadings(document).map((heading) => heading.id)).toEqual(['순서', '순서-1'])
  })
})

describe('Toc', () => {
  it('renders nothing when there are fewer than two headings', () => {
    const { container } = render(<Toc document={[{ type: 'markdown', markdown: '## 하나뿐' }]} labels={labels} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders anchors for every heading', () => {
    render(
      <Toc document={[{ type: 'markdown', markdown: '## 준비물\n\n### 수건' }]} labels={labels} />,
    )
    expect(screen.getByRole('navigation', { name: '목차' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '준비물' })).toHaveAttribute('href', '#준비물')
    expect(screen.getByRole('link', { name: '수건' })).toHaveAttribute('href', '#수건')
  })
})
