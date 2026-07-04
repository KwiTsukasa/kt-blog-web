import type { BlogLive2DManifest } from '@/components/blog/live2d/types';

/**
 * Loads the Pio-only Live2D manifest used by the official runtime bridge.
 * @param manifestUrl Runtime manifest URL configured for the current Blog deployment.
 * @returns Validated Pio manifest consumed by `BlogLive2D`.
 */
export async function fetchBlogLive2DManifest(manifestUrl: string): Promise<BlogLive2DManifest> {
  const response = await fetch(manifestUrl, { credentials: 'omit' });
  if (!response.ok) {
    throw new Error(`Live2D manifest failed: ${response.status}`);
  }

  const manifest = (await response.json()) as Partial<BlogLive2DManifest> | null;
  if (
    !manifest ||
    manifest.character !== 'pio' ||
    manifest.fallback !== null ||
    typeof manifest.model3 !== 'string' ||
    typeof manifest.runtimeScript !== 'string'
  ) {
    throw new Error('Only Pio Live2D manifest is allowed.');
  }

  return manifest as BlogLive2DManifest;
}
