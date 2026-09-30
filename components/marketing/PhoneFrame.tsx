import Image from 'next/image'

export type PhoneFrameProps = {
  src: string
  alt: string
  /** 긴 전체 캡처는 true. 하단을 부드럽게 페이드해 스크롤되는 앱처럼 보이게 한다. */
  tall?: boolean
  /** 바깥 프레임에 더할 클래스. 폭은 호출부가 반드시 지정해야 하고, 회전도 호출부가 정한다. */
  className?: string
  /** 첫 화면에 보이는 폰은 true로 두어 LCP를 앞당긴다. */
  preload?: boolean
  /** 호출부가 정한 폭에 맞춰 내려받을 이미지 크기를 알려준다. */
  sizes?: string
}

export function PhoneFrame({
  src,
  alt,
  tall = false,
  className = '',
  preload = false,
  sizes = '(max-width: 640px) 70vw, 300px',
}: PhoneFrameProps) {
  return (
    <div
      className={`mx-auto rounded-[34px] bg-[#1C1C1E] p-2 shadow-[0_30px_60px_-24px_rgba(80,50,0,0.35)] ${className}`}
    >
      <div className="relative aspect-[402/874] overflow-hidden rounded-[26px] bg-white">
        <Image
          src={src}
          alt={alt}
          fill
          preload={preload}
          sizes={sizes}
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
