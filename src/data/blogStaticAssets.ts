export const PREVIOUS_BLOG_BACKGROUND_IMAGE = 'https://s3.kwitsukasa.top/images/bg-冬滚滚.png';
export const PREVIOUS_BLOG_AUTHOR_AVATAR = 'https://s3.kwitsukasa.top/images/avatar-tsukasa-1.jpg';
export const LOCAL_BLOG_BACKGROUND_IMAGE = '/blog-assets/bg-donggungun.png';
export const LOCAL_BLOG_AUTHOR_AVATAR = '/blog-assets/avatar-tsukasa-1.jpg';

const LEGACY_ARGON_ASSET_REPLACEMENTS: Record<string, string> = {
  '/argon/theme/img-1-1200x1000.jpg': PREVIOUS_BLOG_BACKGROUND_IMAGE,
  '/argon/theme/img-2-1200x1000.jpg': PREVIOUS_BLOG_BACKGROUND_IMAGE,
  '/argon/theme/landing.jpg': PREVIOUS_BLOG_BACKGROUND_IMAGE,
  '/argon/theme/profile.jpg': PREVIOUS_BLOG_AUTHOR_AVATAR,
  '/argon/theme/promo-1.png': PREVIOUS_BLOG_BACKGROUND_IMAGE,
};

/**
 * Resolves theme/article image values while keeping the old real online resources as the primary source.
 *
 * @param value Image URL from API data, static captured article data, or a CSS `url(...)` value.
 * @param fallback Primary fallback to use when the value is empty; callers pass the matching online old asset.
 * @returns A usable online/local image URL with legacy Argon demo placeholders mapped back to previous blog assets.
 */
export function resolveBlogStaticAsset(value?: null | string, fallback = PREVIOUS_BLOG_BACKGROUND_IMAGE) {
  const asset = unwrapBlogCssImage(value);
  if (!asset) return fallback;

  const replacementKey = getAssetPath(asset);

  return LEGACY_ARGON_ASSET_REPLACEMENTS[replacementKey] || asset;
}

/**
 * Extracts the raw asset URL from plain URLs and CSS `url(...)` tokens.
 *
 * @param value Candidate image token from the theme API or generated CSS.
 * @returns Trimmed URL/path without surrounding `url(...)` syntax, or an empty string for unusable values.
 */
export function unwrapBlogCssImage(value?: null | string) {
  const normalized = `${value || ''}`.trim();
  if (!normalized) return '';

  const cssImage = /^url\((.*)\)$/i.exec(normalized)?.[1]?.trim();

  return (cssImage ? cssImage.replace(/^['"]|['"]$/g, '') : normalized).trim();
}

/**
 * Normalizes absolute same-path assets to their pathname so legacy placeholder matching is stable.
 *
 * @param asset URL or root-relative path to compare against known Argon demo placeholder files.
 * @returns Pathname for absolute URLs and the original value for root-relative paths.
 */
function getAssetPath(asset: string) {
  if (asset.startsWith('/')) return asset;

  try {
    return new URL(asset).pathname;
  } catch {
    return asset;
  }
}
