export interface BlogLive2DManifest {
  assets?: {
    shaderBase?: string;
    sourceTextureBase?: string;
    textureBase?: string;
  };
  character: 'pio';
  directoryStandard?: {
    catalog: string;
    opsRoot: string;
    publicRoot: string;
    version: string;
  };
  desktopOnly: boolean;
  fallback: null;
  integrity?: {
    manifestSha256?: string;
    mocSha256?: string;
    model3Sha256?: string;
    motionValidationSha256?: string;
    runtimeSha256?: string;
    sourceMotionExportSha256?: string;
    sourceTextureManifestSha256?: string;
  };
  model3: string;
  motionGroups?: Record<string, number>;
  runtimeRig?: {
    type: 'moc3-model-motion';
    validation: string;
  };
  runtimeScript: string;
  sourceTextures?: {
    count: number;
    manifest: string;
  };
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
