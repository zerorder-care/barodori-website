import Image from 'next/image'

export function BarodoriMark({ className }: { className?: string }) {
  return (
    <Image
      src="/images/brand/barodori-mark.png"
      alt=""
      width={40}
      height={40}
      aria-hidden
      className={`rounded-[9px] ${className ?? ''}`}
    />
  )
}
