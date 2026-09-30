import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { headShapeLabCards, labContentsById, monthlyCards } from './knowledgeLab'

// scripts/mock-lab-api.mjs 는 TypeScript 픽스처를 읽을 수 없어 같은 값을 JSON으로 따로 둔다.
// 두 벌이 갈라지면 목 서버로 한 실측이 실제 응답과 달라지므로 여기에서 어긋남을 잡는다.
const mockFixtures = JSON.parse(
  readFileSync(join(process.cwd(), 'scripts', 'mock-lab-fixtures.json'), 'utf8'),
) as Record<string, unknown>

describe('mock lab api fixtures', () => {
  it('carries the note that tells the reader where the source of truth is', () => {
    expect(mockFixtures._note).toBe('lib/api/__fixtures__/knowledgeLab.ts 와 같은 값을 유지한다')
  })

  it('holds the same three keys and nothing else besides the note', () => {
    expect(Object.keys(mockFixtures).sort()).toEqual([
      '_note',
      'contentsById',
      'headShapeLabCards',
      'monthlyCards',
    ])
  })

  it('matches the typescript fixture exactly', () => {
    const { _note, ...data } = mockFixtures
    expect(_note).toBeDefined()
    expect(data).toEqual(
      JSON.parse(
        JSON.stringify({
          headShapeLabCards,
          monthlyCards,
          contentsById: labContentsById,
        }),
      ),
    )
  })
})
