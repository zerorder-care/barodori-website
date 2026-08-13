'use client'

import { useEffect, useRef, useState } from 'react'
import { MASK_SIZE } from '@/lib/head-test/measurement'
import type { Dictionary } from '@/lib/i18n/dictionary'

type PhotoCopy = Dictionary['headTest']['photo']

// 촬영 화면 (UX 스펙 §4.2) — 프리뷰 위 조준선 오버레이(타원·코가 위로·십자선)는 기본 켜짐.
// 권한 거부 시 갤러리·문항 출구를 보장한다. 프레임은 기기 밖으로 나가지 않는다.

export function PhotoCapture({
  copy,
  onCaptured,
  onGallery,
  onUseQuestions,
  onPermissionDenied,
  onBack,
}: {
  copy: PhotoCopy
  onCaptured: (image: ImageData, guideOn: boolean) => void
  onGallery: (file: File) => void
  onUseQuestions: () => void
  onPermissionDenied?: () => void
  onBack: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [permission, setPermission] = useState<'pending' | 'granted' | 'denied'>('pending')
  const [guideOn, setGuideOn] = useState(true)

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false
    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => undefined)
        }
        setPermission('granted')
      } catch {
        if (!cancelled) {
          setPermission('denied')
          onPermissionDenied?.()
        }
      }
    }
    start()
    return () => {
      cancelled = true
      stream?.getTracks().forEach((track) => track.stop())
    }
    // onPermissionDenied는 계측 콜백이라 재구독 사유가 아니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function capture() {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return
    const side = Math.min(video.videoWidth, video.videoHeight)
    const canvas = document.createElement('canvas')
    canvas.width = MASK_SIZE
    canvas.height = MASK_SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(
      video,
      (video.videoWidth - side) / 2,
      (video.videoHeight - side) / 2,
      side,
      side,
      0,
      0,
      MASK_SIZE,
      MASK_SIZE,
    )
    onCaptured(ctx.getImageData(0, 0, MASK_SIZE, MASK_SIZE), guideOn)
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
        <button
          type="button"
          onClick={() => setGuideOn((value) => !value)}
          aria-pressed={guideOn}
          aria-label={copy.overlayToggleLabel}
          className={`rounded-pill border px-3 py-1.5 text-xs font-semibold ${
            guideOn
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
          }`}
        >
          {guideOn ? copy.overlayOnLabel : copy.overlayOffLabel}
        </button>
      </div>

      {permission === 'denied' ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
          <h2 className="text-xl font-bold">{copy.permissionTitle}</h2>
          <p className="mt-3 text-[var(--color-text-secondary)]">{copy.permissionBody}</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-8 w-full rounded-pill bg-[var(--color-primary)] px-6 py-4 text-base font-bold"
          >
            {copy.galleryLabel}
          </button>
          <button
            type="button"
            onClick={onUseQuestions}
            className="mt-3 w-full rounded-pill border border-[var(--color-border)] px-6 py-4 text-base font-bold"
          >
            {copy.useQuestions}
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col px-5 pb-8">
          <p className="text-center text-sm font-medium text-[var(--color-text-secondary)]">
            {copy.guide}
          </p>
          <div className="relative mt-4 aspect-square w-full overflow-hidden rounded-3xl bg-[var(--color-text-primary)]">
            <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
            {guideOn && <AimOverlay noseUpLabel={copy.noseUp} />}
          </div>
          <div className="mt-auto flex items-center justify-between pt-8">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label={copy.galleryLabel}
              className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--color-border)] text-xl"
            >
              🖼️
            </button>
            <button
              type="button"
              onClick={capture}
              disabled={permission !== 'granted'}
              aria-label={copy.shutterLabel}
              className="grid h-[72px] w-[72px] place-items-center rounded-full border-4 border-[var(--color-primary)] bg-white disabled:opacity-50"
            >
              <span className="h-14 w-14 rounded-full bg-[var(--color-primary)]" />
            </button>
            <span aria-hidden className="h-12 w-12" />
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onGallery(file)
          event.target.value = ''
        }}
      />
    </div>
  )
}

/** 조준선: 머리 실루엣 타원 + "코가 위로" 방향 표시 + 십자선 (UX 스펙 §4.2). */
export function AimOverlay({ noseUpLabel }: { noseUpLabel: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <ellipse
          cx="50"
          cy="52"
          rx="30"
          ry="38"
          fill="none"
          stroke="white"
          strokeWidth="0.8"
          strokeDasharray="3 2"
          opacity="0.9"
        />
        <line x1="50" y1="20" x2="50" y2="84" stroke="white" strokeWidth="0.35" opacity="0.6" />
        <line x1="22" y1="52" x2="78" y2="52" stroke="white" strokeWidth="0.35" opacity="0.6" />
        <path d="M50 8 l-4 6 h8 z" fill="white" opacity="0.95" />
      </svg>
      <span className="absolute left-1/2 top-[13%] -translate-x-1/2 text-xs font-semibold text-white drop-shadow">
        {noseUpLabel}
      </span>
    </div>
  )
}
