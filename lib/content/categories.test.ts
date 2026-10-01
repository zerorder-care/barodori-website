import { describe, expect, it } from 'vitest'
import { articleCategories, articleCategoryLabels, isArticleCategory } from './categories'

describe('article categories', () => {
  it('lists the four lab categories in display order', () => {
    expect(articleCategories).toEqual(['exercise-guide', 'disease-info', 'faq', 'monthly'])
  })

  it('has a korean and english label for every category', () => {
    for (const category of articleCategories) {
      expect(articleCategoryLabels[category].ko.length).toBeGreaterThan(0)
      expect(articleCategoryLabels[category].en.length).toBeGreaterThan(0)
    }
  })

  it('accepts only the four values', () => {
    expect(isArticleCategory('monthly')).toBe(true)
    expect(isArticleCategory('by-month')).toBe(false)
    expect(isArticleCategory('')).toBe(false)
  })
})
