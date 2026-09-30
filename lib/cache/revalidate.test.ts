import { describe, expect, it } from 'vitest'
import { decideRevalidate } from './revalidate'

const TOKEN = 'secret-token'

describe('decideRevalidate', () => {
  it('reports a missing configuration with 503', () => {
    expect(decideRevalidate({ authorization: `Bearer ${TOKEN}`, token: undefined, body: null })).toEqual({
      status: 503,
      body: { error: 'revalidate_token_not_configured' },
    })
    expect(decideRevalidate({ authorization: `Bearer ${TOKEN}`, token: '  ', body: null })).toMatchObject({
      status: 503,
    })
  })

  it('rejects a wrong or missing token with 401', () => {
    expect(decideRevalidate({ authorization: null, token: TOKEN, body: null })).toEqual({
      status: 401,
      body: { error: 'unauthorized' },
    })
    expect(decideRevalidate({ authorization: 'Bearer nope', token: TOKEN, body: null })).toMatchObject({ status: 401 })
    expect(decideRevalidate({ authorization: TOKEN, token: TOKEN, body: null })).toMatchObject({ status: 401 })
  })

  it('accepts the lab content tag', () => {
    expect(
      decideRevalidate({
        authorization: `Bearer ${TOKEN}`,
        token: TOKEN,
        body: { tags: ['lab-content'], contentId: 'x', market: 'KR', locale: 'ko', action: 'publish' },
      }),
    ).toEqual({ status: 200, body: { revalidated: true, tags: ['lab-content'] } })
  })

  it('falls back to the lab content tag when the body has no tags', () => {
    expect(decideRevalidate({ authorization: `Bearer ${TOKEN}`, token: TOKEN, body: {} })).toEqual({
      status: 200,
      body: { revalidated: true, tags: ['lab-content'] },
    })
  })

  it('ignores tags that are not allowed', () => {
    expect(
      decideRevalidate({
        authorization: `Bearer ${TOKEN}`,
        token: TOKEN,
        body: { tags: ['lab-content', 'everything', 123] },
      }),
    ).toEqual({ status: 200, body: { revalidated: true, tags: ['lab-content'] } })
  })

  it('revalidates nothing when every tag was rejected', () => {
    expect(
      decideRevalidate({ authorization: `Bearer ${TOKEN}`, token: TOKEN, body: { tags: ['everything'] } }),
    ).toEqual({ status: 200, body: { revalidated: true, tags: [] } })
  })
})
