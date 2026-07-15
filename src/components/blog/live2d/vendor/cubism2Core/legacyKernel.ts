import type { Cubism2CoreTarget } from './coreGlobals';
import { isCubism2CoreReady } from './coreGlobals';
import { installCubism2SdkGlobals } from './sdkGlobalInstaller';

/**
 * Checks whether a target still needs the min.js-derived Cubism2 globals installed.
 * @param target Window-like runtime object inspected before mutating SDK globals.
 * @returns True when at least one required Cubism2 global is missing from the target.
 */
function shouldInstallCubism2Kernel(target: Cubism2CoreTarget): boolean {
  return !isCubism2CoreReady(target);
}

/**
 * Copies the restored min.js-derived Cubism2 SDK exports onto one runtime target.
 * @param target Window-like runtime object used by legacy Cubism2 model code.
 */
function exposeMinjsDerivedKernelGlobals(target: Cubism2CoreTarget): void {
  installCubism2SdkGlobals(target);
}

/**
 * Installs the Live2D Cubism2 compatibility capsule into one runtime target.
 * @param target Window-like object that receives the SDK globals used by legacy Cubism2 model loading.
 */
export function installReadableCubism2Kernel(target: Cubism2CoreTarget = window): void {
  if (!shouldInstallCubism2Kernel(target)) {
    return;
  }

  exposeMinjsDerivedKernelGlobals(target);
}
