export const categories = ['torticollis', 'head-shape', 'exercise', 'by-month'] as const
export type Category = typeof categories[number]

export const allCategoryLabels = { ko: '전체', en: 'All' } as const

export const categoryLabels: Record<Category, { ko: string; en: string }> = {
  torticollis: { ko: '사경·목 관찰', en: 'Neck notes' },
  'head-shape': { ko: '사두·두상 참고', en: 'Head-shape notes' },
  exercise: { ko: '홈케어 운동', en: 'Home-care exercise' },
  'by-month': { ko: '월령별 기록', en: 'By age' },
}

export function isCategory(value: string): value is Category {
  return (categories as readonly string[]).includes(value)
}

// 앱 2.0.0 Knowledge Lab 분류. 설계 문서 6절의 네 값이다.
export const articleCategories = ['exercise-guide', 'disease-info', 'faq', 'monthly'] as const
export type ArticleCategory = typeof articleCategories[number]

export const articleCategoryLabels: Record<ArticleCategory, { ko: string; en: string }> = {
  'exercise-guide': { ko: '운동 가이드', en: 'Exercise guide' },
  'disease-info': { ko: '질환 정보', en: 'Conditions' },
  faq: { ko: '자주 묻는 질문', en: 'FAQ' },
  monthly: { ko: '월령별', en: 'By month' },
}

export function isArticleCategory(value: string): value is ArticleCategory {
  return (articleCategories as readonly string[]).includes(value)
}
