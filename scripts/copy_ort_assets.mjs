// onnxruntime-web의 WASM 런타임을 public/ort/로 복사한다.
// 무거운 바이너리를 저장소에 커밋하지 않기 위해 빌드·개발 시작 시마다 node_modules에서 가져오고,
// public/ort/은 gitignore 대상이다. 대상 파일 목록은 lib/head-test/model.ts의 wasmPaths와 짝을 이룬다.
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'node_modules', 'onnxruntime-web', 'dist')
const dest = join(root, 'public', 'ort')

// jsep 변형은 WebGPU 실행에, 무변형은 WASM 폴백에 쓰인다.
const files = [
  'ort-wasm-simd-threaded.jsep.mjs',
  'ort-wasm-simd-threaded.jsep.wasm',
  'ort-wasm-simd-threaded.mjs',
  'ort-wasm-simd-threaded.wasm',
]

mkdirSync(dest, { recursive: true })
for (const file of files) {
  copyFileSync(join(src, file), join(dest, file))
}
console.log(`ort assets copied: ${files.length} files -> public/ort/`)
