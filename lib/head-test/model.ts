// ONNX Runtime Web 세션 로더 — 브라우저 전용, 라우트 진입 후 필요 시점에만 lazy 로드한다.
// 모델 파일은 공개 저장소에 커밋하지 않는다: 배포는 NEXT_PUBLIC_HEAD_TEST_MODEL_URL(Vercel Blob),
// 로컬 개발은 gitignore된 public/models/ 파일을 쓴다. WASM 런타임은 scripts/copy_ort_assets.mjs가
// public/ort/로 복사한 자체 호스팅 파일에서 로드한다.

import type * as OrtTypes from 'onnxruntime-web'

export const MODEL_INPUT_SHAPE = [1, 256, 256, 3] as const

const LOCAL_MODEL_PATH = '/models/head-segmentation-fp16.onnx'

export function modelUrl(): string {
  return process.env.NEXT_PUBLIC_HEAD_TEST_MODEL_URL ?? LOCAL_MODEL_PATH
}

type LoadedModel = {
  ort: typeof OrtTypes
  session: OrtTypes.InferenceSession
}

let loading: Promise<LoadedModel> | null = null

export function loadModel(): Promise<LoadedModel> {
  if (!loading) {
    loading = createSession().catch((error) => {
      // 실패한 시도를 캐시에 남기면 재시도 출구가 사라진다.
      loading = null
      throw error
    })
  }
  return loading
}

async function createSession(): Promise<LoadedModel> {
  const ort = await import('onnxruntime-web')
  ort.env.wasm.wasmPaths = '/ort/'
  const url = modelUrl()
  // 스파이크 결론: WASM(~160ms/장)이 기준선, WebGPU(~10ms)는 지원 기기에서 속도 최적화로 쓴다.
  try {
    const session = await ort.InferenceSession.create(url, { executionProviders: ['webgpu'] })
    return { ort, session }
  } catch {
    const session = await ort.InferenceSession.create(url, { executionProviders: ['wasm'] })
    return { ort, session }
  }
}

/** [1,256,256,3] float32 입력으로 추론해 픽셀별 확률맵(256×256)을 돌려준다. */
export async function runSegmentation(input: Float32Array): Promise<Float32Array> {
  const { ort, session } = await loadModel()
  const feeds = {
    [session.inputNames[0]]: new ort.Tensor('float32', input, [...MODEL_INPUT_SHAPE]),
  }
  const outputs = await session.run(feeds)
  const output = outputs[session.outputNames[0]]
  return output.data as Float32Array
}
