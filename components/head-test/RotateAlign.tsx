'use client'

import { useEffect, useRef, useState } from 'react'
import { AimOverlay } from '@/components/head-test/PhotoCapture'
import { MASK_SIZE } from '@/lib/head-test/measurement'
import type { Dictionary } from '@/lib/i18n/dictionary'

type PhotoCopy = Dictionary['headTest']['photo']

// 갤러리 업로드 후 회전 정렬 (UX 스펙 §4.3).
// EXIF 방향을 반영해 읽고, 90° 버튼으로 4방향을 순환한 뒤 그 방향 그대로 분석 입력을 만든다.

export function RotateAlign({
  copy,
  file,
  onConfirm,
  onBack,
}: {
  copy: PhotoCopy
  file: File
  onConfirm: (image: ImageData) => void
  onBack: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null)
  const [quarterTurns, setQuarterTurns] = useState(0)

  useEffect(() => {
    let cancelled = false
    createImageBitmap(file, { imageOrientation: 'from-image' })
      .then((image) => {
        if (cancelled) {
          image.close()
        } else {
          setBitmap(image)
        }
      })
      .catch(() => {
        if (!cancelled) onBack()
      })
    return () => {
      cancelled = true
    }
    // onBack은 렌더마다 새 함수여도 비트맵을 다시 읽을 이유가 없다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !bitmap) return
    drawRotated(canvas, bitmap, quarterTurns)
    return () => undefined
  }, [bitmap, quarterTurns])

  useEffect(() => {
    return () => bitmap?.close()
  }, [bitmap])

  function confirm() {
    if (!bitmap) return
    const canvas = document.createElement('canvas')
    canvas.width = MASK_SIZE
    canvas.height = MASK_SIZE
    drawRotated(canvas, bitmap, quarterTurns)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    onConfirm(ctx.getImageData(0, 0, MASK_SIZE, MASK_SIZE))
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex h-14 items-center justify-between px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label={copy.backLabel}
          className="grid h-11 w-11 place-items-center rounded-full text-xl hover:bg-[var(--color-bg-muted)]"
        >
          ←
        </button>
        <span className="rounded-pill bg-[var(--color-bg-muted)] px-3 py-1.5 text-xs font-semibold">
          {copy.badge}
        </span>
        <span aria-hidden className="h-11 w-11" />
      </div>
      <div className="flex flex-1 flex-col px-5 pb-8">
        <h2 className="text-center text-lg font-bold">{copy.alignTitle}</h2>
        <div className="relative mt-4 aspect-square w-full overflow-hidden rounded-3xl bg-[var(--color-text-primary)]">
          <canvas
            ref={canvasRef}
            width={MASK_SIZE}
            height={MASK_SIZE}
            role="img"
            aria-label={copy.alignPreviewAlt}
            className="h-full w-full"
          />
          <AimOverlay noseUpLabel={copy.noseUp} />
        </div>
        <div className="mt-auto flex flex-col gap-3 pt-8">
          <button
            type="button"
            onClick={() => setQuarterTurns((value) => (value + 1) % 4)}
            className="w-full rounded-pill border border-[var(--color-border)] px-6 py-4 text-base font-bold"
          >
            ↻ {copy.rotateLabel}
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!bitmap}
            className="w-full rounded-pill bg-[var(--color-primary)] px-6 py-4 text-base font-bold disabled:opacity-50"
          >
            {copy.analyzeCta}
          </button>
        </div>
      </div>
    </div>
  )
}

/** 짧은 변 기준 중앙 크롭 + 90°×n 회전으로 캔버스를 채운다. */
function drawRotated(canvas: HTMLCanvasElement, bitmap: ImageBitmap, quarterTurns: number): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const side = Math.min(bitmap.width, bitmap.height)
  const sx = (bitmap.width - side) / 2
  const sy = (bitmap.height - side) / 2
  ctx.save()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((quarterTurns * Math.PI) / 2)
  ctx.drawImage(bitmap, sx, sy, side, side, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height)
  ctx.restore()
}
