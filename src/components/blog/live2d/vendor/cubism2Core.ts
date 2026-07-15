import {
  assertCubism2CoreReady,
  CUBISM2_REQUIRED_GLOBALS,
  isCubism2CoreReady,
  type Cubism2CoreTarget,
} from './cubism2Core/coreGlobals';
import { installReadableCubism2Kernel } from './cubism2Core/legacyKernel';

/**
 * Installs the Cubism2 globals needed by the Blog Live2D runtime.
 * @param target Window-like object that receives the Cubism2 runtime globals.
 */
export function installCubism2Core(target: Cubism2CoreTarget = window): void {
  if (!isCubism2CoreReady(target)) {
    installReadableCubism2Kernel(target);
  }
  assertCubism2CoreReady(target);
}

export { assertCubism2CoreReady, CUBISM2_REQUIRED_GLOBALS, isCubism2CoreReady };
export type { Cubism2CoreTarget };
