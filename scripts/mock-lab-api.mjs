// 백엔드 웹 라우트가 뜨기 전에 웹을 실측하기 위한 목 서버다.
// 사용: node scripts/mock-lab-api.mjs  그리고
//       BARODORI_API_BASE_URL=http://127.0.0.1:4010 npm run dev
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'

const PORT = Number(process.env.MOCK_LAB_PORT ?? 4010)
const PREFIX = '/api/v2/knowledge-lab/web'

// 픽스처는 TypeScript라 tsx 없이 읽을 수 없으므로, 목 서버는 같은 데이터를 JSON으로 들고 있는
// scripts/mock-lab-fixtures.json 을 읽는다.
const fixtures = JSON.parse(await readFile(new URL('./mock-lab-fixtures.json', import.meta.url), 'utf8'))

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

function envelope(data) {
  return JSON.stringify({ code: 0, message: 'ok', data })
}

function sendJson(res, data) {
  const body = envelope(data)
  res.writeHead(200, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'public, max-age=60',
    vary: 'Accept-Encoding',
  })
  res.end(body)
}

function sendNotFound(res, reason) {
  res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify({ code: 1040, message: reason, data: null }))
}

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`)
  if (!url.pathname.startsWith(PREFIX)) {
    sendNotFound(res, 'not_found')
    return
  }
  const rest = url.pathname.slice(PREFIX.length)
  const locale = url.searchParams.get('locale') ?? 'ko'
  const market = url.searchParams.get('market') ?? 'KR'

  if (rest === '/contents') {
    if (locale !== 'ko' || market !== 'KR') {
      sendJson(res, { items: [] })
      return
    }
    const collection = url.searchParams.get('collection') ?? 'head_shape_lab'
    const kind = url.searchParams.get('kind')
    const items = (collection === 'home_monthly_information' ? fixtures.monthlyCards : fixtures.headShapeLabCards)
      .filter((card) => !kind || card.kind === kind)
    sendJson(res, { items })
    return
  }

  const detail = /^\/contents\/([^/]+)$/.exec(rest)
  if (detail) {
    const content = locale === 'ko' && market === 'KR' ? fixtures.contentsById[detail[1]] : undefined
    if (!content) {
      sendNotFound(res, 'content_not_found')
      return
    }
    sendJson(res, content)
    return
  }

  const asset = /^\/contents\/([^/]+)\/revisions\/([^/]+)\/assets\/([^/]+)$/.exec(rest)
  if (asset) {
    const content = fixtures.contentsById[asset[1]]
    const found = content?.markdownAssets?.find((item) => item.assetVersionId === asset[3])
    if (!content || content.revisionId !== asset[2] || !found) {
      sendNotFound(res, 'asset_not_found')
      return
    }
    const isImage = found.role === 'image'
    const body = isImage ? PNG_1X1 : Buffer.from('mock attachment bytes\n', 'utf8')
    res.writeHead(200, {
      'content-type': found.contentType,
      'content-disposition': isImage
        ? 'inline'
        : `attachment; filename*=UTF-8''${encodeURIComponent(found.filename)}`,
      'cache-control': 'public, max-age=31536000, immutable',
      etag: `"${found.sha256}"`,
      'x-content-type-options': 'nosniff',
    })
    res.end(body)
    return
  }

  sendNotFound(res, 'not_found')
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`mock lab api listening on http://127.0.0.1:${PORT}${PREFIX}`)
})
