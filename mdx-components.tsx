import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'
import { Callout } from '@/components/article/mdx/Callout'
import { MedicalNotice } from '@/components/article/mdx/MedicalNotice'
import { ExerciseCard } from '@/components/article/mdx/ExerciseCard'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    h2: (props) => <h2 className="mt-10 mb-3 text-2xl font-bold" {...props} />,
    h3: (props) => <h3 className="mt-8 mb-2 text-xl font-semibold" {...props} />,
    p: (props) => <p className="my-4 leading-relaxed" {...props} />,
    ul: (props) => <ul className="my-4 ml-6 list-disc leading-relaxed" {...props} />,
    ol: (props) => <ol className="my-4 ml-6 list-decimal leading-relaxed" {...props} />,
    blockquote: (props) => (
      <blockquote
        className="my-4 border-l-4 border-[--color-border] pl-4 italic text-[--color-text-secondary]"
        {...props}
      />
    ),
    img: (props) => (
      // MDX img → next/image (width/height required, but src 알 수 없으므로 fill)
      <span className="block relative my-6 aspect-[16/9] overflow-hidden rounded-lg">
        <Image
          src={props.src ?? ''}
          alt={props.alt ?? ''}
          fill
          className="object-cover"
        />
      </span>
    ),
    Callout,
    MedicalNotice,
    ExerciseCard,
  }
}
