import type {
  BlogLive2DManifest,
  KtPioLive2DRuntime,
  KtPioLive2DRuntimeHandle,
} from './types';

const RUNTIME_SCRIPT_ID = 'kt-blog-pio-live2d-runtime';
let runtimeScriptPromise: Promise<void> | null = null;

declare global {
  interface Window {
    KtPioLive2D?: KtPioLive2DRuntime;
  }
}

/**
 * Loads the generated official Cubism runtime script and mounts the Pio model.
 * @param canvas Canvas element owned by the Vue component.
 * @param manifest Validated Pio manifest with runtime script and model URL.
 * @returns Runtime handle used by the component teardown path.
 */
export async function mountOfficialPioRuntime(
  canvas: HTMLCanvasElement,
  manifest: BlogLive2DManifest,
): Promise<KtPioLive2DRuntimeHandle> {
  await appendRuntimeScript(manifest.runtimeScript);
  if (!window.KtPioLive2D) {
    throw new Error('KtPioLive2D runtime was not registered.');
  }

  return window.KtPioLive2D.mount({ canvas, model3: manifest.model3 });
}

/**
 * Appends the official Cubism runtime wrapper only once per document.
 * @param src Versioned runtime script URL generated from the self-hosted Pio package.
 * @returns Promise that resolves after the script is available to register `window.KtPioLive2D`.
 */
async function appendRuntimeScript(src: string): Promise<void> {
  if (runtimeScriptPromise) {
    return runtimeScriptPromise;
  }

  if (document.getElementById(RUNTIME_SCRIPT_ID)) {
    return;
  }

  let resolveLoad: () => void = () => undefined;
  let rejectLoad: (error: Error) => void = () => undefined;
  runtimeScriptPromise = new Promise<void>((resolve, reject) => {
    resolveLoad = resolve;
    rejectLoad = reject;
  });

  const script = document.createElement('script');
  script.id = RUNTIME_SCRIPT_ID;
  script.src = src;
  script.async = true;
  script.onload = () => {
    runtimeScriptPromise = null;
    resolveLoad();
  };
  script.onerror = () => {
    runtimeScriptPromise = null;
    script.remove();
    rejectLoad(new Error(`Live2D runtime failed: ${src}`));
  };
  document.body.appendChild(script);

  return runtimeScriptPromise;
}
