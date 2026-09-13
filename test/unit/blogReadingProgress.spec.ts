import { describe, expect, it } from 'vitest'

import { calculateBlogReadingProgress } from '@/factories/blogAnimationFactory'

describe('article reading progress', () => {
  const article = {
    articleTop: 500,
    articleHeight: 3000,
    viewportHeight: 800,
    scrollHeight: 5000,
  }

  it('measures the same article interval for the start, midpoint and end', () => {
    expect(calculateBlogReadingProgress({ ...article, scrollTop: 0 })).toBe(0)
    expect(calculateBlogReadingProgress({ ...article, scrollTop: 420 })).toBe(0)
    expect(calculateBlogReadingProgress({ ...article, scrollTop: 1585 })).toBe(0.5)
    expect(calculateBlogReadingProgress({ ...article, scrollTop: 2750 })).toBe(1)
  })

  it('finishes before trailing comments and longer sidebars end', () => {
    expect(calculateBlogReadingProgress({ ...article, scrollTop: 4200 })).toBe(1)
  })

  it('reaches completion at the native bottom when the desired inset cannot be scrolled', () => {
    const clippedEnd = { ...article, scrollHeight: 3500 }
    expect(calculateBlogReadingProgress({ ...clippedEnd, scrollTop: 2700 })).toBe(1)
    expect(calculateBlogReadingProgress({ ...clippedEnd, scrollTop: 2699.5 })).toBe(1)
    expect(calculateBlogReadingProgress({ ...clippedEnd, scrollTop: 2650 })).toBeLessThan(1)
  })

  it('finishes a fully visible short article without requiring a scroll event', () => {
    expect(calculateBlogReadingProgress({
      articleTop: 100, articleHeight: 300, viewportHeight: 800, scrollHeight: 800, scrollTop: 0,
    })).toBe(1)
  })

  it('uses the scroll viewport height when it differs from the browser window', () => {
    expect(calculateBlogReadingProgress({ ...article, viewportHeight: 600, scrollTop: 2750 })).toBeLessThan(1)
    expect(calculateBlogReadingProgress({ ...article, viewportHeight: 600, scrollTop: 2950 })).toBe(1)
  })

  it('clamps overscroll and ignores unmeasurable article layouts', () => {
    expect(calculateBlogReadingProgress({ ...article, scrollTop: -30 })).toBe(0)
    expect(calculateBlogReadingProgress({ ...article, scrollTop: 9999 })).toBe(1)
    expect(calculateBlogReadingProgress({ ...article, scrollTop: NaN })).toBe(0)
    expect(calculateBlogReadingProgress({ ...article, scrollTop: 0, articleHeight: 0 })).toBe(0)
  })
})
