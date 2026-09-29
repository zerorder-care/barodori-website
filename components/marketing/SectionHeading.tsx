const PILL_BG = {
  orange: 'bg-[var(--color-orange-50)]',
  white: 'bg-white shadow-[0_0_5px_rgba(0,0,0,0.05)]',
} as const

export function SectionHeading({
  id,
  label,
  title,
  pill = 'orange',
}: {
  id: string
  label: string
  title: string
  /** 섹션 바탕이 주황이면 라벨을 흰색으로 띄워 대비를 지킨다. */
  pill?: 'orange' | 'white'
}) {
  return (
    <>
      <p
        className={`inline-flex rounded-pill ${PILL_BG[pill]} px-3 py-1.5 text-[13px] font-semibold leading-[1.3] text-[var(--color-hero-fg)]`}
      >
        {label}
      </p>
      <h2
        id={id}
        className="mt-4 text-[28px] font-bold leading-[1.2] tracking-[-0.5px] text-[var(--color-gray-900)] sm:text-4xl lg:text-[40px]"
      >
        {title}
      </h2>
    </>
  )
}
