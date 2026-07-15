import { installCubism2Core } from '../vendor/cubism2Core';
import { assertCubism2CoreReady } from '../vendor/cubism2Core/coreGlobals';

let coreLoadPromise: Promise<void> | null = null;

/**
 * Installs the Cubism2 core globals once for the TypeScript Live2D runtime.
 * @returns Promise that resolves after required Cubism2 globals are available.
 */
export function loadCubism2Core(): Promise<void> {
  if (coreLoadPromise) {
    return coreLoadPromise;
  }

  coreLoadPromise = Promise.resolve()
    .then(() => {
      installCubism2Core(window);
      assertCubism2CoreReady(window);
    })
    .catch((error: unknown) => {
      coreLoadPromise = null;
      throw error;
    });

  return coreLoadPromise;
}
