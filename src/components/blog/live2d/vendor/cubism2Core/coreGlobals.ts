export type Cubism2CoreTarget = Window & typeof globalThis;

export const CUBISM2_REQUIRED_GLOBALS = ['Live2D', 'Live2DModelWebGL', 'Live2DMotion', 'MotionQueueManager'] as const;

/**
 * Checks whether all Cubism2 globals required by the Blog runtime are present.
 * @param target Window-like object where the Cubism2 kernel registers globals.
 * @returns True when the required Cubism2 runtime API is ready.
 */
export function isCubism2CoreReady(target: Cubism2CoreTarget = window): boolean {
  const globals = target as unknown as Record<string, unknown>;
  return CUBISM2_REQUIRED_GLOBALS.every((globalName) => Boolean(globals[globalName]));
}

/**
 * Throws a named error when the Cubism2 kernel did not expose its required globals.
 * @param target Window-like object where the Cubism2 kernel registers globals.
 */
export function assertCubism2CoreReady(target: Cubism2CoreTarget = window): void {
  const globals = target as unknown as Record<string, unknown>;
  const missingGlobals = CUBISM2_REQUIRED_GLOBALS.filter((globalName) => !globals[globalName]);
  if (missingGlobals.length > 0) {
    throw new Error(`Cubism2 core did not expose required globals: ${missingGlobals.join(', ')}`);
  }
}
