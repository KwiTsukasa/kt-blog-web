import type { Cubism2CoreTarget } from './coreGlobals';
import * as Cubism2Sdk2 from './compatibility/minjsDerivedCubism2Sdk2';
import { CUBISM2_SDK_GLOBALS, type Cubism2SdkGlobalName } from './sdkGlobalNames';

/**
 * Exposes the imported Cubism2 SDK module on a window-like object.
 * @param target Runtime target that older Cubism2 call sites read globals from.
 */
export function installCubism2SdkGlobals(target: Cubism2CoreTarget): void {
  const globals = target as unknown as Record<Cubism2SdkGlobalName, unknown>;
  for (const globalName of CUBISM2_SDK_GLOBALS) {
    globals[globalName] = Cubism2Sdk2[globalName];
  }
}
