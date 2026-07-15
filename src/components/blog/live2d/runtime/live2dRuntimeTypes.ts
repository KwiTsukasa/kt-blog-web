import type {
  Cubism2AMotionInstance,
  Cubism2MotionQueueManagerConstructor,
  Cubism2MotionQueueManagerInstance,
} from '../vendor/cubism2Core/motionBase';
import type { Cubism2Live2DMotionConstructor } from '../vendor/cubism2Core/motionParser';
import type { Cubism2ModelContextLike } from '../vendor/cubism2Core/modelBase';
import type {
  Cubism2ModelWebGLConstructor,
  Cubism2ModelWebGLInstance,
} from '../vendor/cubism2Core/modelWrappers';

export type Live2DCoreMotion = Cubism2AMotionInstance;

export type Live2DCoreModelContext = Cubism2ModelContextLike;

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

export type Live2DCoreMotionConstructor = Cubism2Live2DMotionConstructor;

export type Live2DCoreModel = Cubism2ModelWebGLInstance;

export type Live2DCoreModelConstructor = Cubism2ModelWebGLConstructor;

export type Live2DMotionQueueManager = Cubism2MotionQueueManagerInstance;

export type MotionQueueManagerConstructor = Cubism2MotionQueueManagerConstructor;
