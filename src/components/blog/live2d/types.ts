export interface BlogLive2DManifest {
  character: 'pio';
  desktopOnly: boolean;
  fallback: null;
  integrity?: {
    manifestSha256?: string;
  };
  model3: string;
  runtimeScript: string;
  version: string;
}

export interface KtPioLive2DRuntimeHandle {
  /**
   * Releases canvas bindings, animation frames, and WebGL/runtime resources owned by the mounted Pio model.
   */
  destroy(): void;
}

export interface KtPioLive2DRuntime {
  /**
   * Mounts the self-hosted Pio model into the canvas controlled by `BlogLive2D`.
   * @param options Canvas and model URL emitted by the validated manifest.
   * @returns Runtime handle used by Vue teardown to release rendering resources.
   */
  mount(options: { canvas: HTMLCanvasElement; model3: string }): Promise<KtPioLive2DRuntimeHandle>;
}
