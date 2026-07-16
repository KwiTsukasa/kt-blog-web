const COSTUME_LABELS: Readonly<Record<string, string>> = {
  'akiba idol': '秋叶原偶像装',
  animal: '动物装',
  bikini: '比基尼',
  blackcat: '黑猫装',
  blazer: '西装制服',
  blueround: '蓝色圆领装',
  'bunny girl': '兔女郎装',
  cake: '蛋糕装',
  'cami dress': '吊带连衣裙',
  'cute pajamas': '可爱睡衣',
  default: '默认服装',
  dress: '连衣裙',
  'elementary school': '小学制服',
  'fall dress': '秋日连衣裙',
  'forest witch': '森林女巫装',
  'frill bikini': '荷叶边比基尼',
  'frill blouse': '荷叶边衬衫',
  furisode: '振袖和服',
  goddess: '女神装',
  halloween: '万圣节装',
  hanbok: '韩服',
  healer: '治愈师装',
  hood: '连帽装',
  jersey: '运动服',
  kids: '童装',
  knight: '骑士装',
  'literature girl': '文学少女装',
  lolita: '洛丽塔装',
  'macaron dress': '马卡龙连衣裙',
  'magical girl': '魔法少女装',
  maid: '女仆装',
  marine: '海军风服装',
  new2015: '羊年装',
  'night witch': '暗夜女巫装',
  nightsky: '星空装',
  nordic: '北欧风连衣裙',
  nurse: '护士服',
  overalls: '背带裤',
  pajamas: '睡衣',
  'party dress': '派对礼服',
  priest: '祭司服',
  pushcat: '推推猫装',
  qipao: '旗袍',
  'ribbon dress': '蝴蝶结连衣裙',
  sabori: '萨博里装',
  sailor: '水手服',
  'sailor bikini': '水手风比基尼',
  sakura: '樱花水手服',
  'sakura fairy': '樱花精灵装',
  santa: '圣诞装',
  'santa 2018': '2018 圣诞装',
  santa2016: '2016 圣诞装',
  sarori: '萨罗里装',
  school: '学院制服',
  'school 2017': '2017 学院制服',
  'school 2019': '2019 学院制服',
  'sfc uniform': '特别学院制服',
  shaman: '萨满服',
  sinsiroad: '辛西罗德制服',
  'sinsiroad shop': '辛西罗德商店制服',
  sorceress: '女术士装',
  'sports bikini': '运动比基尼',
  'sporty hood': '运动连帽装',
  'spring dress': '春日连衣裙',
  'star witch': '星之女巫装',
  succubus: '魅魔装',
  sukumizu: '学校泳装',
  sulbim: '节日韩服',
  'summer dress': '夏日连衣裙',
  'summer uniform': '夏季制服',
  'swimsuit 2017': '2017 泳装',
  thief: '盗贼装',
  tirami1: '提拉米装',
  traveler: '旅行者装',
  turtleneck: '高领毛衣',
  valentine: '情人节装',
  vampire: '吸血鬼装',
  'voice story': '语音故事服装',
  warrior: '战士装',
  whiteday: '白色情人节礼服',
  winter: '冬装',
  'winter coat': '冬季大衣',
  'winter coat 2017': '2017 冬季大衣',
  'winter fairy': '冬日精灵装',
  witch: '女巫装',
}

const KNOWN_COSTUME_LABEL_OVERRIDES: Readonly<Record<string, string>> = {
  animal: '兔子睡衣',
  'animal racoon': '浣熊睡衣',
  'bikini blue': '天蓝色比基尼',
  'blazer black': '黑色西装外套',
  'blazer brown': '棕色西装外套',
  blueround: '蓝环装',
  'bunny girl': '黑色兔女郎装',
  'cake choco': '巧克力蛋糕裙',
  'cake cream': '奶油蛋糕裙',
  dress: '紫色缎带连衣裙',
  'dress brown': '棕色缎带连衣裙',
  'elementary school': '校园制服',
  healer: '尼特装（治疗师）',
  hanbok: '经典韩服',
  'hood gray': '灰色连帽衫',
  'hood red': '红色连帽衫',
  kids: '天蓝色幼儿园制服',
  'kids navy': '藏青色幼儿园制服',
  knight: '多尔伯装（骑士）',
  'macaron dress green': '蜜瓜马卡龙连衣裙',
  'macaron dress pink': '草莓马卡龙连衣裙',
  maid: '藏青色女仆装',
  'maid blue': '天蓝色女仆装',
  marine: '白色海军风服装',
  new2015: '绵羊装',
  'new2015 pajamas': '绵羊睡衣',
  nurse: '白色护士装',
  overalls: '经典背带裤装',
  pajamas: '黄色睡衣',
  sailor: '白色水手服',
  sakura: '粉色樱花水手服',
  'sakura fairy real': '樱花妖精装（觉醒）',
  santa: '红色圣诞装',
  'santa 2018 green': '2018 绿色圣诞装',
  'santa 2018 red': '2018 红色圣诞装',
  school: '棕色魔法学院制服',
  'school 2017 gray': '2017 灰色学院制服',
  'school 2017 yellow': '2017 黄色学院制服',
  'school 2019 black': '2019 黑色学院制服',
  'school 2019 pink': '2019 粉色学院制服',
  'school red': '红色魔法学院制服',
  sorceress: '卢克装（魔法师）',
  'star witch': '绿色星之女巫装',
  sukumizu: '藏青色学校泳装',
  'summer dress blue': '天蓝色夏日连衣裙',
  'sulbim rainbow': '彩虹新年韩服',
  'sulbim snowflake': '雪花新年韩服',
  'swimsuit 2017 navy': '2017 藏青色泳装',
  'swimsuit 2017 red': '2017 红色泳装',
  thief: '皮莉娅装（盗贼）',
  traveler: '旅行装',
  turtleneck: '经典高领毛衣',
  'vampire real': '吸血鬼装（觉醒）',
  warrior: '克莱尔装（战士）',
  winter: '藏青色冬装',
  'winter coat 2017 brown': '2017 棕色冬季大衣',
  'winter coat 2017 white': '2017 白色冬季大衣',
  'witch special': '特别版猫咪女巫装',
  'witch white': '白色猫咪女巫装',
  witch: '黑色猫咪女巫装',
}

const COSTUME_VARIANT_PREFIXES: Readonly<Record<string, string>> = {
  beige: '米色',
  black: '黑色',
  blue: '蓝色',
  brown: '棕色',
  choco: '巧克力色',
  cream: '奶油色',
  gorgeous: '华丽',
  gray: '灰色',
  green: '绿色',
  junior: '初阶',
  navy: '藏青色',
  pink: '粉色',
  purple: '紫色',
  racoon: '浣熊',
  rainbow: '彩虹',
  red: '红色',
  senior: '高阶',
  skyblue: '天蓝色',
  snowflake: '雪花',
  white: '白色',
  yellow: '黄色',
}

const COSTUME_VARIANT_SUFFIXES: Readonly<Record<string, string>> = {
  pajamas: '睡衣款',
  real: '特别版',
  special: '特别版',
}

const FALLBACK_WORD_TRANSLATIONS: Readonly<Record<string, string>> = {
  autumn: '秋日',
  casual: '休闲',
  cat: '猫咪',
  classic: '经典',
  coat: '外套',
  cute: '可爱',
  dog: '狗狗',
  dress: '连衣裙',
  elegant: '优雅',
  emerald: '翡翠',
  fairy: '精灵',
  flower: '花卉',
  formal: '正装',
  future: '未来',
  gothic: '哥特',
  idol: '偶像',
  jacket: '夹克',
  magical: '魔法',
  mystery: '神秘',
  ocean: '海洋',
  party: '派对',
  princess: '公主',
  rabbit: '兔子',
  royal: '皇家',
  school: '校园',
  shirt: '衬衫',
  spring: '春日',
  summer: '夏日',
  uniform: '制服',
  winter: '冬日',
}

/**
 * Converts one Cubism texture filename into a stable Chinese costume name.
 * @param texture Texture path from a model settings file.
 * @returns Semantic Chinese display label derived from the captured catalog name.
 */
export function resolveLive2DCostumeLabel(texture: string): string {
  const normalizedName = normalizeCostumeName(texture)
  const knownLabel = KNOWN_COSTUME_LABEL_OVERRIDES[normalizedName]
  if (knownLabel) {
    return knownLabel
  }
  const directLabel = COSTUME_LABELS[normalizedName]
  if (directLabel) {
    return directLabel
  }

  const nameParts = normalizedName.split(' ')
  const variantName = nameParts.pop() || ''
  const baseLabel = COSTUME_LABELS[nameParts.join(' ')]
  if (!baseLabel) {
    return translateUncataloguedCostumeName(normalizedName)
  }

  const prefix = COSTUME_VARIANT_PREFIXES[variantName]
  if (prefix) {
    return `${prefix}${baseLabel}`
  }
  const suffix = COSTUME_VARIANT_SUFFIXES[variantName]
  if (suffix) {
    return `${baseLabel}·${suffix}`
  }
  return translateUncataloguedCostumeName(normalizedName)
}

/**
 * Produces a semantic word-level translation for names added after the captured catalogs.
 * @param normalizedName Normalized basename without its generic costume token.
 * @returns Readable translated label without index-based placeholder naming.
 */
function translateUncataloguedCostumeName(normalizedName: string): string {
  const translatedName = normalizedName
    .split(' ')
    .filter(Boolean)
    .map((word) => COSTUME_VARIANT_PREFIXES[word] || FALLBACK_WORD_TRANSLATIONS[word] || '主题')
    .filter((word, index, words) => word !== '主题' || words[index - 1] !== word)
    .join('')
  if (!translatedName) {
    return '新款服装'
  }
  if (/(?:装|服|裙|衣|裤|泳装|比基尼|睡衣|制服|礼服|和服|旗袍|毛衣)$/.test(translatedName)) {
    return translatedName
  }
  return `${translatedName}服装`
}

/**
 * Normalizes WordPress and captured-model filename styles into one lookup key.
 * @param texture Texture path whose basename may use spaces, hyphens, or underscores.
 * @returns Lowercase costume key without extension or the generic `costume` token.
 */
function normalizeCostumeName(texture: string): string {
  const filename = texture.split('/').pop() || ''
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .toLowerCase()
    .replace(/\bcostume\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
