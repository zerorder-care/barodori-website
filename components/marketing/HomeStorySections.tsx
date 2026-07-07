import { Container } from '@/components/ui/Container'
import { PhoneFrame } from '@/components/marketing/PhoneFrame'
import { Reveal } from '@/components/marketing/Reveal'
import type { Dictionary } from '@/lib/i18n/dictionary'

type StorySectionCopy = Dictionary['home']['storySections'][number]

type StorySectionMeta = {
  id: string
  screen: { src: string; tall?: boolean }
  bg: string
}

const sectionMeta: readonly StorySectionMeta[] = [
  {
    id: 'home',
    screen: {
      src: '/images/app-screens/home.png',
    },
    bg: 'bg-white',
  },
  {
    id: 'exercise',
    screen: {
      src: '/images/app-screens/exercise-timer.png',
    },
    bg: 'bg-[var(--color-primary-light)]',
  },
  {
    id: 'record',
    screen: {
      src: '/images/app-screens/session-report.png',
      tall: true,
    },
    bg: 'bg-white',
  },
  {
    id: 'flow',
    screen: {
      src: '/images/app-screens/calendar-report.png',
      tall: true,
    },
    bg: 'bg-[var(--color-bg-muted)]',
  },
  {
    id: 'community',
    screen: {
      src: '/images/app-screens/community.png',
      tall: true,
    },
    bg: 'bg-white',
  },
  {
    id: 'parent',
    screen: {
      src: '/images/app-screens/parent-check.png',
    },
    bg: 'bg-[var(--color-primary-light)]',
  },
]

export function HomeStorySections({ sections }: { sections: readonly StorySectionCopy[] }) {
  return (
    <>
      {sections.map((section, index) => {
        const meta = getSectionMeta(section.id, index)
        return (
          <section
            key={section.id}
            aria-labelledby={`story-${section.id}-title`}
            className={`${meta.bg} py-20 sm:py-28`}
          >
            <Container>
              <div
                className={`grid items-center gap-10 lg:grid-cols-2 ${
                  index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
                }`}
              >
                <Reveal>
                  <h2
                    id={`story-${section.id}-title`}
                    className="text-3xl font-bold leading-tight text-[var(--color-text-primary)] sm:text-4xl lg:text-5xl"
                  >
                    {renderLines(section.title)}
                  </h2>
                  <p className="mt-5 text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
                    {renderLines(section.body)}
                  </p>
                  <ul className="mt-7 flex flex-wrap gap-2 text-sm font-semibold text-[var(--color-primary-dark)]">
                    {section.chips.map((chip) => (
                      <li
                        key={chip}
                        className="rounded-pill border border-[#FDE68A] bg-white px-3 py-1"
                      >
                        {chip}
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <Reveal delayMs={120}>
                  <PhoneFrame
                    src={meta.screen.src}
                    alt={section.screenAlt}
                    tall={meta.screen.tall}
                  />
                </Reveal>
              </div>
            </Container>
          </section>
        )
      })}
    </>
  )
}

function getSectionMeta(id: string, index: number): StorySectionMeta {
  return sectionMeta.find((item) => item.id === id) ?? sectionMeta[index] ?? sectionMeta[0]
}

function renderLines(value: string) {
  return value.split('\n').map((line, index) => (
    <span key={`${line}-${index}`}>
      {index > 0 && <br />}
      {line}
    </span>
  ))
}
