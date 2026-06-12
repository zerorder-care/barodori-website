export const categories = ['torticollis', 'head-shape', 'exercise', 'by-month'] as const
export type Category = typeof categories[number]

export const categoryLabels: Record<Category, { ko: string; en: string }> = {
  torticollis: { ko: '사경·목 관찰', en: 'Neck notes' },
  'head-shape': { ko: '사두·두상 참고', en: 'Head-shape notes' },
  exercise: { ko: '홈케어 운동', en: 'Home-care exercise' },
  'by-month': { ko: '월령별 기록', en: 'By age' },
}

export function isCategory(value: string): value is Category {
  return (categories as readonly string[]).includes(value)
}
