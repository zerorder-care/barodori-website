// 두상 세그멘테이션 모델을 빌드 시점에 Vercel Blob에서 받아 public/models/에 둔다.
// 스토어가 private이라 브라우저용 영구 URL이 없으므로, 만료되는 서명 URL 대신
// 우리 도메인(/models/...)에서 직접 서빙한다. 모델은 저장소에 커밋하지 않는다.
//
// - Vercel 빌드: 연결된 스토어의 BLOB_READ_WRITE_TOKEN이 자동 주입되어 다운로드가 실행된다.
// - 로컬 개발: 토큰이 없으면 건너뛴다. public/models/에 파일을 직접 둔 경우 그대로 쓴다.
import { list } from '@vercel/blob'
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const MODEL_FILENAME = 'head-segmentation-fp16.onnx'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dest = join(root, 'public', 'models', MODEL_FILENAME)
const token = process.env.BLOB_READ_WRITE_TOKEN

if (!token) {
  if (existsSync(dest)) {
    console.log(`fetch_model: no blob token; using local ${MODEL_FILENAME}`)
  } else {
    console.warn(
      'fetch_model: no blob token and no local model — photo analysis will fall back to questions',
    )
  }
  process.exit(0)
}

const { blobs } = await list({ token })
const blob = blobs.find((b) => b.pathname.endsWith(MODEL_FILENAME))
if (!blob) {
  console.error(`fetch_model: ${MODEL_FILENAME} not found in the blob store`)
  process.exit(1)
}

const response = await fetch(blob.downloadUrl ?? blob.url)
if (!response.ok) {
  console.error(`fetch_model: download failed with ${response.status}`)
  process.exit(1)
}

mkdirSync(dirname(dest), { recursive: true })
writeFileSync(dest, Buffer.from(await response.arrayBuffer()))
console.log(`fetch_model: downloaded ${MODEL_FILENAME} (${statSync(dest).size} bytes)`)
