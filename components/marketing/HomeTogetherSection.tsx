import { Container } from '@/components/ui/Container'

export function HomeTogetherSection() {
  return (
    <section className="pb-4 pt-4 sm:py-10" aria-labelledby="home-together-title">
      <Container className="text-center">
        <h2 id="home-together-title" className="text-2xl font-bold leading-tight sm:text-6xl md:text-7xl lg:text-6xl">
          바로도리와 함께
        </h2>
      </Container>
    </section>
  )
}
