import Image from 'next/image'

export type PhoneFrameProps = {
  src: string
  alt: string
  /** 긴 전체 캡처(③④⑤)는 true → 하단을 부드럽게 페이드해 "스크롤되는 앱" 느낌 */
  tall?: boolean
}

export function PhoneFrame({ src, alt, tall = false }: PhoneFrameProps) {
  return (
    <div className="mx-auto w-full max-w-[300px] rounded-[32px] bg-[#111827] p-2 shadow-[0_28px_60px_-32px_rgba(0,0,0,0.45)]">
      <div className="relative aspect-[786/1704] overflow-hidden rounded-[24px] bg-white">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 70vw, 300px"
          className="object-cover object-top"
        />
        {tall && (
          <div
            data-testid="screen-fade"
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-b from-transparent to-white"
          />
        )}
      </div>
    </div>
  )
}
