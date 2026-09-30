import { revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { decideRevalidate } from '@/lib/cache/revalidate'

export async function POST(request: NextRequest) {
  let body: unknown = null
  try {
    body = await request.json()
  } catch {
    body = null
  }

  const decision = decideRevalidate({
    authorization: request.headers.get('authorization'),
    token: process.env.LAB_REVALIDATE_TOKEN,
    body,
  })

  if (decision.status === 200) {
    for (const tag of decision.body.tags) {
      // 두 번째 인자 없는 형태는 폐기 예정이라 'max'를 준다. 태그가 stale로 표시되고
      // 다음 방문에서 백그라운드로 새 값을 받는다.
      revalidateTag(tag, 'max')
    }
  }

  return NextResponse.json(decision.body, { status: decision.status })
}
