type Heading = { level: 2 | 3; text: string; id: string }

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/\s+/g, '-')
}

export function Toc({ markdown }: { markdown: string }) {
  const headings: Heading[] = []
  const re = /^(##|###)\s+(.+)$/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(markdown)) !== null) {
    const level = m[1].length === 2 ? 2 : 3
    const text = m[2].trim()
    headings.push({ level: level as 2 | 3, text, id: slugify(text) })
  }
  if (headings.length < 2) return null
  return (
    <nav aria-label="목차" className="mb-8 rounded-lg bg-[var(--color-bg-muted)] p-4 text-sm">
      <p className="font-semibold">목차</p>
      <ul className="mt-2 space-y-1">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'ml-4' : ''}>
            <a href={`#${h.id}`} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
