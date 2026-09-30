import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

// 1.4 시절 MDX 아티클 6편의 주소다. 개별 대응 글이 없으므로 목록으로 영구 이동한다.
const LEGACY_ARTICLE_SLUGS = [
  'torticollis-symptoms',
  'tummy-time-guide',
  'baby-head-shape-asymmetry-record',
  'torticollis-stretching-safety-record',
  'baby-neck-turning-one-side',
  'baby-torticollis-homecare-record',
]

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return LEGACY_ARTICLE_SLUGS.map((slug) => ({
      source: `/:locale(ko|en)/articles/${slug}`,
      destination: '/ko/articles',
      permanent: true,
    }))
  },
}

// Turbopack의 @next/mdx 로더는 직렬화 가능한 옵션만 받음 -> plugin 함수는 string 이름으로 전달
const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: ['rehype-slug'],
  },
})

export default withMDX(nextConfig)
