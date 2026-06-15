export function BarodoriMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="20" cy="20" r="16.5" fill="#A9C3EA" stroke="#111827" strokeWidth="3" />
      <path
        d="M12.5 25.5 C 16 19.5, 23.5 17.5, 28.5 15.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
