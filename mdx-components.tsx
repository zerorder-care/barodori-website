import type { MDXComponents } from 'mdx/types'
import { Callout } from '@/components/article/mdx/Callout'
import { MedicalNotice } from '@/components/article/mdx/MedicalNotice'
import { ExerciseCard } from '@/components/article/mdx/ExerciseCard'

/** Internal builder — not named `use*` so it is safe to call from async Server Components. */
function buildMDXComponents(components: MDXComponents): MDXComponents {
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
      <span className="relative my-6 block aspect-[16/9] overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={props.src ?? ''}
          alt={props.alt ?? ''}
          className="h-full w-full object-cover"
        />
      </span>
    ),
    Callout,
    MedicalNotice,
    ExerciseCard,
  }
}

/** Required by @next/mdx for MDX file rendering. */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return buildMDXComponents(components)
}

/** Plain alias for use in async Server Components (avoids react-hooks/rules-of-hooks). */
export function getMDXComponents(components: MDXComponents): MDXComponents {
  return buildMDXComponents(components)
}
