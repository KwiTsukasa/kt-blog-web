import { describe, expect, it } from 'vitest'

import { resolveLive2DCostumeLabel } from '@/components/blog/live2d/live2dCostumeLabels'

describe('Blog Live2D Chinese costume labels', () => {
  it.each([
    ['textures/default-costume.png', '默认服装'],
    ['textures/Akiba Idol Costume.png', '秋叶原偶像装'],
    ['textures/Animal Costume Racoon.png', '浣熊睡衣'],
    ['textures/bikini-costume-blue.png', '天蓝色比基尼'],
    ['textures/Bunny Girl Costume Red.png', '红色兔女郎装'],
    ['textures/Sinsiroad Shop Costume Senior.png', '高阶辛西罗德商店制服'],
    ['textures/vampire-costume-real.png', '吸血鬼装（觉醒）'],
    ['textures/Witch Costume Special.png', '特别版猫咪女巫装'],
  ])('translates %s into %s', (texture, expectedLabel) => {
    expect(resolveLive2DCostumeLabel(texture)).toBe(expectedLabel)
  })

  it('semantically translates a newly added name without index-based placeholder naming', () => {
    const label = resolveLive2DCostumeLabel('textures/Future Mystery Costume.png')

    expect(label).toBe('未来神秘服装')
    expect(label).not.toMatch(/[a-z]/i)
  })

  it('keeps uncatalogued semantic words in Chinese instead of leaking the basename', () => {
    expect(resolveLive2DCostumeLabel('textures/Emerald Princess Costume.png')).toBe('翡翠公主服装')
    expect(resolveLive2DCostumeLabel('textures/Unmapped Codename Costume.png')).toBe('主题服装')
  })
})
