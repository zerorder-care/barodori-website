export const categories = ['torticollis', 'head-shape', 'exercise', 'by-month'] as const
export type Category = typeof categories[number]

export const categoryLabels: Record<Category, { ko: string; en: string }> = {
  torticollis: { ko: '사경', en: 'Torticollis' },
  'head-shape': { ko: '두상', en: 'Head shape' },
  exercise: { ko: '운동', en: 'Exercise' },
  'by-month': { ko: '월령', en: 'By month' },
}

export function isCategory(value: string): value is Category {
  return (categories as readonly string[]).includes(value)
}
