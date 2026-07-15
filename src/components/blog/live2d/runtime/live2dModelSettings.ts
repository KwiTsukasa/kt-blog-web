import type { Live2DHitAreas, Live2DModelSettings, Live2DMotionSetting } from './live2dRuntimeTypes';

interface RawLive2DModelSettings {
  hit_areas_custom?: {
    body_x?: [number, number];
    body_y?: [number, number];
    head_x?: [number, number];
    head_y?: [number, number];
  };
  layout?: Record<string, number>;
  model?: unknown;
  motions?: Record<string, Array<{ fade_in?: number; fade_out?: number; file?: unknown }>>;
  textures?: unknown;
}

/**
 * Fetches a Cubism2 MOC settings file and normalizes it for the TS runtime.
 * @param url Public API URL for a Blog Live2D `index.json`.
 * @returns Normalized settings with filtered texture and motion entries.
 */
export async function fetchLive2DModelSettings(url: string): Promise<Live2DModelSettings> {
  const response = await fetch(url, { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`Live2D model settings request failed: ${response.status}`);
  }
  return normalizeLive2DModelSettings(url, (await response.json()) as RawLive2DModelSettings);
}

/**
 * Normalizes a raw WordPress/Cubism2 model settings JSON object.
 * @param url Settings URL used to derive relative asset base paths.
 * @param raw Raw JSON parsed from `index.json`.
 * @returns Runtime settings with safe arrays and typed hit areas.
 */
export function normalizeLive2DModelSettings(url: string, raw: RawLive2DModelSettings): Live2DModelSettings {
  const model = typeof raw.model === 'string' && raw.model.trim() ? raw.model.trim() : '';
  if (!model) {
    throw new Error('Live2D model settings missing model file.');
  }

  return {
    baseUrl: url.slice(0, url.lastIndexOf('/') + 1),
    hitAreas: normalizeHitAreas(raw.hit_areas_custom),
    layout: raw.layout,
    model,
    motions: normalizeMotions(raw.motions),
    textures: Array.isArray(raw.textures)
      ? raw.textures.filter((texture): texture is string => typeof texture === 'string' && texture.trim().length > 0)
      : [],
    url,
  };
}

/**
 * Converts WordPress hit area keys to local camel-case keys.
 * @param raw Raw custom hit area object from the MOC settings file.
 * @returns Hit area ranges used by tap motion logic.
 */
function normalizeHitAreas(raw: RawLive2DModelSettings['hit_areas_custom']): Live2DHitAreas {
  return {
    bodyX: raw?.body_x,
    bodyY: raw?.body_y,
    headX: raw?.head_x,
    headY: raw?.head_y,
  };
}

/**
 * Keeps only motion entries with a concrete file path.
 * @param raw Raw motion group map from the settings file.
 * @returns Motion groups keyed by Cubism motion group name.
 */
function normalizeMotions(raw: RawLive2DModelSettings['motions']): Record<string, Live2DMotionSetting[]> {
  const motions: Record<string, Live2DMotionSetting[]> = {};
  Object.entries(raw || {}).forEach(([group, entries]) => {
    const validEntries = entries
      .filter((entry): entry is { fade_in?: number; fade_out?: number; file: string } => typeof entry.file === 'string' && entry.file.trim().length > 0)
      .map((entry) => ({
        fadeIn: entry.fade_in,
        fadeOut: entry.fade_out,
        file: entry.file.trim(),
      }));
    if (validEntries.length > 0) {
      motions[group] = validEntries;
    }
  });
  return motions;
}
