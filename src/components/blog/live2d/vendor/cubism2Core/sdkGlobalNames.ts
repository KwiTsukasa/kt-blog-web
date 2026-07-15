/**
 * Public Cubism2 SDK global names in the same order as the legacy min.js tail export block.
 */
export const CUBISM2_SDK_GLOBALS = [
  'UtSystem',
  'UtDebug',
  'LDTransform',
  'LDGL',
  'Live2D',
  'Live2DModelWebGL',
  'Live2DModelJS',
  'Live2DMotion',
  'MotionQueueManager',
  'PhysicsHair',
  'AMotion',
  'PartsDataID',
  'DrawDataID',
  'BaseDataID',
  'ParamID',
] as const;

export type Cubism2SdkGlobalName = (typeof CUBISM2_SDK_GLOBALS)[number];

export type Cubism2SdkGlobalMap = Record<Cubism2SdkGlobalName, unknown>;
