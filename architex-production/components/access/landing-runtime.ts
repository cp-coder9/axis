declare global {
  interface Window {
    __architexLandingBridge?: { root: ShadowRoot };
  }
}

export function bindLandingRuntime(runtime: string): string {
  return runtime
    .replace('(() => {', '(() => { const landingRoot = window.__architexLandingBridge.root;')
    .replaceAll('root = document', 'root = landingRoot')
    .replaceAll('document.getElementById', 'landingRoot.getElementById')
    .replaceAll('document.body.contains(canvas)', 'landingRoot.contains(canvas)');
}

export function installLandingRuntime(root: ShadowRoot, runtime: string): () => void {
  window.__architexLandingBridge = { root };
  const script = document.createElement('script');
  script.dataset.preview3Runtime = 'true';
  script.textContent = bindLandingRuntime(runtime);
  root.appendChild(script);

  return () => {
    script.remove();
    if (window.__architexLandingBridge?.root === root) delete window.__architexLandingBridge;
  };
}
