import type { LabCard, LabContent } from '@/lib/api/knowledgeLab'

export const EXERCISE_CONTENT_ID = '11111111-1111-4111-8111-111111111111'
export const EXERCISE_REVISION_ID = '11111111-2222-4222-8222-222222222222'
export const EXERCISE_IMAGE_ASSET_ID = '11111111-3333-4333-8333-333333333333'
export const EXERCISE_ATTACHMENT_ASSET_ID = '11111111-4444-4444-8444-444444444444'

export const FAQ_CONTENT_ID = '22222222-1111-4111-8111-111111111111'
export const FAQ_REVISION_ID = '22222222-2222-4222-8222-222222222222'

export const MONTHLY_CONTENT_ID = '33333333-1111-4111-8111-111111111111'
export const MONTHLY_REVISION_ID = '33333333-2222-4222-8222-222222222222'

export const LEGACY_CONTENT_ID = '44444444-1111-4111-8111-111111111111'
export const LEGACY_REVISION_ID = '44444444-2222-4222-8222-222222222222'

const EXERCISE_MARKDOWN = [
  '# 도리도리 운동 따라 하기',
  '',
  '아기가 깨어 있고 기분이 좋은 때에 하루 세 번 나누어 합니다.',
  '',
  '![엎드려 놀기 자세](lab-asset:11111111-3333-4333-8333-333333333333)',
  '',
  '## 준비물',
  '',
  '| 준비물 | 개수 |',
  '| --- | --- |',
  '| 수건 | 1장 |',
  '| 놀이매트 | 1개 |',
  '',
  '- [x] 기저귀 갈기',
  '- [ ] 수유 후 30분 지나기',
  '',
  '## 순서',
  '',
  '1. 아기를 매트에 눕힙니다.',
  '2. 고개를 천천히 반대쪽으로 돌립니다.',
  '',
  '오늘 한 횟수는 앱에서 `기록하기`.',
  '',
  '`사경`은 목 근육이 한쪽으로 짧아진 상태를 뜻합니다.',
  '',
  '기록지는 [운동 기록지 PDF](lab-asset:11111111-4444-4444-8444-444444444444)에서 받습니다.',
  '',
  '참고 자료는 [질병관리청 안내](https://www.kdca.go.kr)에 있습니다.',
].join('\n')

export const exerciseContent: LabContent = {
  id: EXERCISE_CONTENT_ID,
  revisionId: EXERCISE_REVISION_ID,
  releaseId: '11111111-5555-4555-8555-555555555555',
  generation: 3,
  kind: 'exercise_guide',
  locale: 'ko',
  market: 'KR',
  title: '도리도리 운동 따라 하기(부제: 하루 세 번 3분이면 충분해요)',
  summary: '아기가 편안할 때 하루 세 번, 한 번에 3분씩 목을 부드럽게 돌려 주는 방법을 정리했어요.',
  thumbnailUrl: null,
  durationSeconds: 240,
  targetTracks: ['head_shape', 'torticollis'],
  placements: [{ collection: 'head_shape_lab', order: 0, monthMin: null, monthMax: null }],
  publishedAt: '2026-09-11T02:00:00Z',
  schemaVersion: 2,
  rendererVersion: 'knowledge-markdown-v1',
  renderDocument: [
    { type: 'markdown', markdown: EXERCISE_MARKDOWN },
    {
      type: 'callout',
      icon: '\u{1F4A1}',
      children: [{ type: 'markdown', markdown: '아기가 울면 바로 멈추고 다음 기회에 다시 합니다.' }],
    },
    {
      type: 'disclosure',
      title: '자주 하는 실수',
      children: [
        { type: 'markdown', markdown: '### 너무 세게 누르기\n\n손끝에 힘을 주지 않습니다.' },
      ],
    },
  ],
  markdownAssets: [
    {
      assetVersionId: EXERCISE_IMAGE_ASSET_ID,
      filename: 'tummy-time.png',
      contentType: 'image/png',
      byteLength: 184320,
      sha256: 'a'.repeat(64),
      role: 'image',
    },
    {
      assetVersionId: EXERCISE_ATTACHMENT_ASSET_ID,
      filename: '운동 기록지.pdf',
      contentType: 'application/pdf',
      byteLength: 40960,
      sha256: 'b'.repeat(64),
      role: 'attachment',
    },
  ],
}

export const faqContent: LabContent = {
  id: FAQ_CONTENT_ID,
  revisionId: FAQ_REVISION_ID,
  releaseId: '22222222-5555-4555-8555-555555555555',
  generation: 1,
  kind: 'faq',
  locale: 'ko',
  market: 'KR',
  title: '사경 운동은 언제까지 해야 하나요?',
  summary: '담당 전문의가 정한 기간을 따릅니다. 보호자가 스스로 기간을 늘리거나 줄이지 않습니다.',
  thumbnailUrl: null,
  durationSeconds: null,
  targetTracks: ['torticollis'],
  placements: [{ collection: 'head_shape_lab', order: 5, monthMin: null, monthMax: null }],
  publishedAt: '2026-09-05T02:00:00Z',
  schemaVersion: 2,
  rendererVersion: 'knowledge-markdown-v1',
  renderDocument: [
    {
      type: 'markdown',
      markdown: '기간은 아이마다 다릅니다. 진료 때 정한 목표를 앱에 적어 두고 그대로 따릅니다.',
    },
  ],
  markdownAssets: [],
}

export const monthlyContent: LabContent = {
  id: MONTHLY_CONTENT_ID,
  revisionId: MONTHLY_REVISION_ID,
  releaseId: '33333333-5555-4555-8555-555555555555',
  generation: 1,
  kind: 'disease_info',
  locale: 'ko',
  market: 'KR',
  title: '13개월 이후의 목 관찰(부제: 걷기 시작한 뒤에 볼 것)',
  summary: null,
  thumbnailUrl: 'https://cdn.barodori.com/lab/monthly-13.png',
  durationSeconds: null,
  targetTracks: ['torticollis'],
  placements: [{ collection: 'home_monthly_information', order: 0, monthMin: 13, monthMax: null }],
  publishedAt: '2026-08-20T02:00:00Z',
  schemaVersion: 2,
  rendererVersion: 'knowledge-markdown-v1',
  renderDocument: [
    { type: 'markdown', markdown: '걷기 시작하면 앉은 자세보다 선 자세에서 목 기울기를 봅니다.' },
  ],
  markdownAssets: [],
}

export const legacyBlocksContent: LabContent = {
  id: LEGACY_CONTENT_ID,
  revisionId: LEGACY_REVISION_ID,
  releaseId: '44444444-5555-4555-8555-555555555555',
  generation: 1,
  kind: 'disease_info',
  locale: 'ko',
  market: 'KR',
  title: '사두증이란',
  summary: null,
  thumbnailUrl: null,
  durationSeconds: null,
  targetTracks: ['head_shape'],
  placements: [{ collection: 'head_shape_lab', order: 2, monthMin: null, monthMax: null }],
  publishedAt: '2026-07-01T02:00:00Z',
  schemaVersion: 1,
  blocks: [
    { type: 'heading', text: '정의' },
    { type: 'paragraph', text: '머리 뒤쪽 한 곳이 납작해진 상태를 말합니다.' },
  ],
}

export const labContentsById: Record<string, LabContent> = {
  [EXERCISE_CONTENT_ID]: exerciseContent,
  [FAQ_CONTENT_ID]: faqContent,
  [MONTHLY_CONTENT_ID]: monthlyContent,
  [LEGACY_CONTENT_ID]: legacyBlocksContent,
}

function toCard(content: LabContent): LabCard {
  const heroAsset =
    content.schemaVersion === 2
      ? content.markdownAssets.find((asset) => asset.role === 'image')
      : undefined
  return {
    id: content.id,
    revisionId: content.revisionId,
    kind: content.kind,
    title: content.title,
    summary: content.summary,
    thumbnailUrl: content.thumbnailUrl,
    durationSeconds: content.durationSeconds,
    targetTracks: content.targetTracks,
    placements: content.placements,
    publishedAt: content.publishedAt,
    heroAsset: heroAsset
      ? { assetVersionId: heroAsset.assetVersionId, contentType: heroAsset.contentType }
      : null,
  }
}

export const headShapeLabCards: LabCard[] = [exerciseContent, legacyBlocksContent, faqContent].map(toCard)
export const monthlyCards: LabCard[] = [monthlyContent].map(toCard)

export function labFixtureEnvelope<T>(data: T): { code: number; message: string; data: T } {
  return { code: 0, message: 'ok', data }
}
