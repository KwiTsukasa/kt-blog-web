export interface Live2DCoreMotion {
  setFadeIn: (milliseconds: number) => void;
  setFadeOut: (milliseconds: number) => void;
}

export interface Live2DCoreModelContext {
  getParamFloat(paramIndex: number): number;
  getParamMax(paramIndex: number): number;
  getParamMin(paramIndex: number): number;
}

export interface Live2DModelEntry {
  key: string;
  label: string;
  modelUrl: string;
}

export interface Live2DMotionSetting {
  fadeIn?: number;
  fadeOut?: number;
  file: string;
}

export interface Live2DHitAreas {
  bodyX?: [number, number];
  bodyY?: [number, number];
  headX?: [number, number];
  headY?: [number, number];
}

export interface Live2DModelSettings {
  baseUrl: string;
  hitAreas: Live2DHitAreas;
  layout?: Record<string, number>;
  model: string;
  motions: Record<string, Live2DMotionSetting[]>;
  textures: string[];
  url: string;
}

export interface Live2DResolvedState {
  modelKey: string;
  settings: Live2DModelSettings;
  textureIndex: number;
}

export interface Live2DTSRuntime {
  destroy(): void;
  getState(): Live2DResolvedState | null;
  mount(): Promise<Live2DResolvedState>;
  switchModel(modelKey: string): Promise<Live2DResolvedState>;
  switchTexture(textureIndex: number): Promise<Live2DResolvedState>;
}

export interface Live2DRendererAdapter {
  destroy(): void;
  mount(state: Live2DResolvedState): Promise<void>;
  switchModel(state: Live2DResolvedState): Promise<void>;
  switchTexture(state: Live2DResolvedState): Promise<void>;
}

export interface Live2DRuntimeStorage {
  readModelKey(): string | null;
  readTextureIndex(modelKey: string, textureCount: number): number;
  writeModelKey(modelKey: string): void;
  writeTextureIndex(modelKey: string, textureIndex: number): void;
}

export interface Live2DCoreMotionConstructor {
  /**
   * Loads a Cubism2 motion from an ArrayBuffer.
   * @param buffer Motion binary data fetched from a `.mtn` URL.
   * @returns Motion object consumed by the Cubism2 motion queue.
   */
  loadMotion(buffer: ArrayBuffer): Live2DCoreMotion;
}

export interface Live2DCoreModel {
  addToParamFloat(id: string, value: number, weight?: number): void;
  draw(): void;
  getCanvasHeight(): number;
  getCanvasWidth(): number;
  getModelContext(): Live2DCoreModelContext;
  getParamIndex(id: string): number;
  isPremultipliedAlpha?: () => boolean;
  loadParam(): void;
  saveParam(): void;
  setMatrix?: (matrix: Float32Array) => void;
  setParamFloat(id: string, value: number, weight?: number): void;
  setTexture(index: number, texture: WebGLTexture): void;
  update(): void;
}

export interface Live2DCoreModelConstructor {
  /**
   * Loads a Cubism2 MOC model from an ArrayBuffer.
   * @param buffer MOC binary data fetched from a model settings file.
   * @returns Live2D core model instance.
   */
  loadModel(buffer: ArrayBuffer): Live2DCoreModel;
}

export interface Live2DMotionQueueManager {
  isFinished(motionHandle?: number): boolean;
  startMotion(motion: Live2DCoreMotion, priority?: number): number;
  stopAllMotions(): void;
  updateParam(model: Live2DCoreModel): boolean;
}

export interface MotionQueueManagerConstructor {
  new (): Live2DMotionQueueManager;
}

declare global {
  interface Window {
    Live2DModelWebGL?: Live2DCoreModelConstructor;
    Live2DMotion?: Live2DCoreMotionConstructor;
    Live2D?: {
      setGL?: (gl: WebGLRenderingContext) => void;
    };
    MotionQueueManager?: MotionQueueManagerConstructor;
  }
}
