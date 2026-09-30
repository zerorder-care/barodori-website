import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/marketing/Reveal'
import { SectionHeading } from '@/components/marketing/SectionHeading'
import type { Dictionary } from '@/lib/i18n/dictionary'

type TogetherCopy = Dictionary['home']['together']

function CardArt({ id }: { id: string }) {
  // 보호자 연동 카드는 겹친 얼굴 두 개, 두상연구소 카드는 아티클 썸네일을 쓴다.
  if (id === 'guardian') {
    return (
      <div className="flex -space-x-3">
        <Image
          src="/images/home-v2/avatar-1.png"
          alt=""
          role="presentation"
          width={520}
          height={520}
          sizes="56px"
          className="h-14 w-14 rounded-full"
        />
        <Image
          src="/images/home-v2/avatar-2.png"
          alt=""
          role="presentation"
          width={520}
          height={520}
          sizes="56px"
          className="h-14 w-14 rounded-full"
        />
      </div>
    )
  }
  return (
    <Image
      src="/images/home-v2/article-thumb.png"
      alt=""
      role="presentation"
      width={418}
      height={236}
      sizes="100px"
      className="h-14 w-auto rounded-[10px]"
    />
  )
}

export function TogetherCards({ copy }: { copy: TogetherCopy }) {
  return (
    <section aria-labelledby="together-title" className="bg-white py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading id="together-title" label={copy.label} title={copy.title} pill="orange" />
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {copy.cards.map((card, index) => (
            <Reveal key={card.id} delayMs={index * 100}>
              <article className="h-full rounded-[20px] bg-[var(--color-gray-50)] p-7 shadow-[0_0_5px_rgba(0,0,0,0.05)]">
                <CardArt id={card.id} />
                <h3 className="mt-6 text-xl font-bold leading-snug text-[var(--color-gray-900)]">{card.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-gray-600)]">{card.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
