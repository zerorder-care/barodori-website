import { beforeAll, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  EXERCISE_ATTACHMENT_ASSET_ID,
  EXERCISE_CONTENT_ID,
  EXERCISE_IMAGE_ASSET_ID,
  EXERCISE_REVISION_ID,
  exerciseContent,
} from '@/lib/api/__fixtures__/knowledgeLab'
import { LabDocument, isFeatureLinkText } from './LabDocument'

beforeAll(() => {
  process.env.BARODORI_API_BASE_URL = 'https://api.test'
})

const labels = { attachment: '첨부 파일', featureLink: '앱에서 이어서 하기' }

function renderExercise() {
  const assets = exerciseContent.schemaVersion === 2 ? exerciseContent.markdownAssets : []
  const document = exerciseContent.schemaVersion === 2 ? exerciseContent.renderDocument : []
  return render(
    <LabDocument
      document={document}
      assets={assets}
      contentId={EXERCISE_CONTENT_ID}
      revisionId={EXERCISE_REVISION_ID}
      locale="ko"
      title="도리도리 운동 따라 하기"
      labels={labels}
    />,
  )
}

describe('isFeatureLinkText', () => {
  it('accepts the app feature endings', () => {
    expect(isFeatureLinkText('기록하기')).toBe(true)
    expect(isFeatureLinkText('두상 리포트 보기')).toBe(true)
    expect(isFeatureLinkText('운동 시작하기')).toBe(true)
  })

  it('rejects medical terms', () => {
    expect(isFeatureLinkText('사경')).toBe(false)
    expect(isFeatureLinkText('사두증')).toBe(false)
  })
})

describe('LabDocument', () => {
  it('renders the three node kinds', () => {
    renderExercise()
    expect(screen.getByText('아기가 울면 바로 멈추고 다음 기회에 다시 합니다.')).toBeInTheDocument()
    expect(screen.getByText('자주 하는 실수')).toBeInTheDocument()
    expect(screen.getByRole('note')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '준비물' })).toBeInTheDocument()
  })

  it('lifts a level one heading to level two so the page keeps a single h1', () => {
    renderExercise()
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
    expect(screen.getByRole('heading', { level: 2, name: '도리도리 운동 따라 하기' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '준비물' })).toBeInTheDocument()
  })

  it('rewrites a lab-asset image to the backend asset url', () => {
    renderExercise()
    const image = screen.getByAltText('엎드려 놀기 자세')
    expect(image).toHaveAttribute(
      'src',
      `https://api.test/api/v2/knowledge-lab/web/contents/${EXERCISE_CONTENT_ID}` +
        `/revisions/${EXERCISE_REVISION_ID}/assets/${EXERCISE_IMAGE_ASSET_ID}?market=KR&locale=ko`,
    )
    expect(image).toHaveAttribute('loading', 'lazy')
  })

  it('renders an attachment link with its file name', () => {
    renderExercise()
    const link = screen.getByRole('link', { name: /운동 기록지 PDF/ })
    expect(link).toHaveAttribute(
      'href',
      `https://api.test/api/v2/knowledge-lab/web/contents/${EXERCISE_CONTENT_ID}` +
        `/revisions/${EXERCISE_REVISION_ID}/assets/${EXERCISE_ATTACHMENT_ASSET_ID}?market=KR&locale=ko`,
    )
    expect(link).toHaveTextContent('운동 기록지.pdf')
    expect(link).toHaveTextContent('첨부 파일')
  })

  it('opens an external https link in a new tab', () => {
    renderExercise()
    const link = screen.getByRole('link', { name: '질병관리청 안내' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('turns a feature inline code into an install link and leaves a medical term as code', () => {
    renderExercise()
    const button = screen.getByRole('link', { name: /기록하기/ })
    expect(button).toHaveAttribute('href', '/ko/install')
    expect(button).toHaveTextContent('앱에서 이어서 하기')
    expect(screen.getByText('사경', { selector: 'code' })).toBeInTheDocument()
  })

  it('renders a gfm table', () => {
    renderExercise()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: '준비물' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '놀이매트' })).toBeInTheDocument()
  })

  it('renders the markdown nested inside a disclosure body', () => {
    renderExercise()
    expect(screen.getByRole('heading', { level: 3, name: '너무 세게 누르기' })).toBeInTheDocument()
    expect(screen.getByText('손끝에 힘을 주지 않습니다.')).toBeInTheDocument()
  })

  it('drops an image whose lab-asset id is not a uuid instead of throwing', () => {
    const { container } = render(
      <LabDocument
        document={[{ type: 'markdown', markdown: '![깨진 이미지](lab-asset:not-a-uuid)' }]}
        assets={[]}
        contentId={EXERCISE_CONTENT_ID}
        revisionId={EXERCISE_REVISION_ID}
        locale="ko"
        title="잘못된 자산 참조"
        labels={labels}
      />,
    )
    expect(container.querySelectorAll('img')).toHaveLength(0)
  })

  it('gives each markdown node its own heading ids so the toc can mirror them per node', () => {
    render(
      <LabDocument
        document={[
          { type: 'markdown', markdown: '## 준비물\n\n첫째 조각입니다.' },
          { type: 'markdown', markdown: '## 준비물\n\n둘째 조각입니다.' },
        ]}
        assets={[]}
        contentId={EXERCISE_CONTENT_ID}
        revisionId={EXERCISE_REVISION_ID}
        locale="ko"
        title="조각마다 다시 세는 제목"
        labels={labels}
      />,
    )
    const headings = screen.getAllByRole('heading', { level: 2, name: '준비물' })
    expect(headings).toHaveLength(2)
    expect(headings.map((heading) => heading.id)).toEqual(['준비물', '준비물'])
  })

  it('falls back to the article title when the image alt is empty', () => {
    render(
      <LabDocument
        document={[{ type: 'markdown', markdown: `![](lab-asset:${EXERCISE_IMAGE_ASSET_ID})` }]}
        assets={[]}
        contentId={EXERCISE_CONTENT_ID}
        revisionId={EXERCISE_REVISION_ID}
        locale="ko"
        title="대체 텍스트 없는 글"
        labels={labels}
      />,
    )
    expect(screen.getByAltText('대체 텍스트 없는 글')).toBeInTheDocument()
  })
})
