# Three.js in Test Environments — A Practical Guide for Jest & Friends (2025)

This guideline shows how to use “real” Three.js classes (e.g., `Color`, `Vector3`, `Matrix4`, `WebGLRenderer`) in tests without hand-mocking the entire library. It covers unit, integration, and visual/E2E layers; gives ready-to-paste configs; and flags the gotchas that usually bite teams.

General playbook: start with pure math in Node; add jsdom only when the DOM is involved; pull in headless-gl for renderer-level tests; and reserve Playwright for WebGL2/visual checks with GPU flags. The copy-paste configs above should get you running quickly, and the caveats and links call out the foot-guns.

---

## 1) Choose the right test layer

**A. Pure unit tests (math & data structures) — Node env**

- What to test: `Color`, `Vector*`, `Matrix4`, material parameter objects, helpers with no DOM.
- Environment: `testEnvironment: "node"` (fast, no DOM).
- ESM note: Three.js is ESM; configure Jest for ESM (see §3). Jest’s ESM support is still labeled “experimental”, so follow their steps (e.g., `--experimental-vm-modules`) ([jestjs.io][1]).

**B. DOM integration (no WebGL) — jsdom env**

- What to test: code that touches `document`, sizes a `<canvas>`, event wiring, etc.
- Environment: `jest-environment-jsdom` (install it—Jest stopped bundling it in v28+) ([jestjs.io][2]).
- Canvas note: jsdom treats `<canvas>` like a `<div>` unless you add the `canvas` package or a mock; otherwise `getContext` throws “Not implemented” ([GitHub][3]).

**C. WebGL integration in Node — “real” GL via headless-gl**

- Goal: run `WebGLRenderer` for pixel-level assertions without a browser.
- Tooling: inject a WebGL context from **headless-gl** (`gl` package). It provides a WebGL context in Node, aiming at WebGL 1.0.3 (WebGL2 support is marked experimental) ([GitHub][4]).

**D. Visual/E2E — real browser (Playwright)**

- Goal: catch rendering regressions with screenshots.
- Use Playwright’s built-in screenshot snapshots: `await expect(page).toHaveScreenshot()` ([Playwright][5]).
- For headless WebGL performance/stability, pass GPU flags like `--use-gl=egl`/`--use-gl=desktop` (Chrome/Chromium); teams report big wins with those on CI ([Michel Krämer’s portfolio and blog][6]).

---

## 2) Recommended testing strategy

1. **Keep math logic separate** from renderer code. Most of Three’s classes are pure and test nicely in Node.

2. **When you need `WebGLRenderer` in Jest**, prefer:
   - **Node + headless-gl** for fast, deterministic pixel tests (WebGL1 feature set), or
   - **Playwright** for WebGL2 features, GPU-specific paths, and full browser semantics.

3. **For DOM-only tests**, use jsdom and (optionally) `canvas`/`jest-canvas-mock` only when you touch `<canvas>` APIs; don’t pay the cost otherwise. jsdom’s canvas support requires the `canvas` peer dependency; without it, `<canvas>` behaves like a `<div>` and `getContext` is unimplemented ([GitHub][3]).

4. **Do serialized/state snapshots instead of object graph snapshots**:
   - Use `object3D.toJSON()` and `ObjectLoader` for stable, text-based snapshots of scenes/meshes/materials ([threejs.org][7]).

5. **When you need pixels**, render to a **`WebGLRenderTarget`** and read with `renderer.readRenderTargetPixels(...)`. It wraps `gl.readPixels` and works well in Node+headless-gl. Be mindful of types (reads `UnsignedByteType`) and limitations (not MRT/MSAA targets) ([threejs.org][8]).

6. **For visual regression**, favor Playwright’s `toHaveScreenshot` or Jest + `jest-image-snapshot` (pixelmatch) for buffers you produce server-side ([Playwright][5]).

---

## 3) Minimal, copy-pasteable setups

### 3.1 Jest + ESM (works for JS/TS)

**`package.json`**

```json
{
  "type": "module",
  "scripts": {
    "test": "NODE_OPTIONS='--experimental-vm-modules' jest"
  }
}
```

**`jest.config.mjs`**

```js
/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  transform: {}, // don't transpile to CJS; keep ESM
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
  moduleNameMapper: {}, // if you alias paths
};
```

Why: Jest’s guide requires either no transforms or ESM-emitting transforms and running Node with `--experimental-vm-modules` for ESM support ([jestjs.io][1]).

### 3.2 jsdom + canvas (no WebGL)

Install:

```bash
npm i -D jest-environment-jsdom canvas
```

**`jest.config.mjs`**

```js
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup-canvas.ts'],
};
```

**`test/setup-canvas.ts`**

```ts
// If you need a 2D canvas API in jsdom:
import 'canvas'; // jsdom will pick this up automatically (peer dep)
// Or, alternative: jest-canvas-mock if you only need basic APIs:
// import "jest-canvas-mock";
```

jsdom uses the `canvas` package to implement `<canvas>`; otherwise `getContext` isn’t there ([GitHub][3]).

### 3.3 WebGL in Jest (Node) using headless-gl

Install:

```bash
npm i -D gl
```

**`jest.config.mjs`**

```js
export default {
  testEnvironment: 'jsdom', // we want a DOM + our own WebGL context
  setupFilesAfterEnv: ['<rootDir>/test/setup-webgl.ts'],
  transform: {},
};
```

**`test/setup-webgl.ts`**

```ts
// Inject a WebGL (WebGL1) context for <canvas>.getContext('webgl')
import createGL from 'gl';

const orig = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (type: string, attrs?: any) {
  if (type === 'webgl' || type === 'experimental-webgl') {
    const w = this.width || 1;
    const h = this.height || 1;
    const gl = createGL(w, h, { preserveDrawingBuffer: true, ...attrs });
    return gl; // headless-gl WebGLRenderingContext
  }
  return orig.call(this, type, attrs);
};
```

- `gl` creates a WebGL context in Node and targets WebGL 1.0.3; WebGL2 is experimental. For WebGL2 features, prefer Playwright (browser) tests ([GitHub][4]).
- Community pattern: mock `getContext` to return headless-gl in Jest/jsdom ([three.js forum][9]).

**Example pixel test (Node):**

```ts
import * as THREE from 'three';

test('renders red pixel', () => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 4;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    preserveDrawingBuffer: true,
  });
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('red');
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 10);
  camera.position.z = 1;

  renderer.setSize(4, 4, false);
  renderer.render(scene, camera);

  const rt = new THREE.WebGLRenderTarget(4, 4);
  renderer.setRenderTarget(rt);
  renderer.render(scene, camera);

  const buf = new Uint8Array(4);
  renderer.readRenderTargetPixels(rt, 0, 0, 1, 1, buf); // wraps gl.readPixels
  expect(buf[0]).toBe(255); // R
  expect(buf[1]).toBe(0); // G
  expect(buf[2]).toBe(0); // B

  rt.dispose();
  renderer.dispose(); // frees GPU resources
});
```

`readRenderTargetPixels` is the supported way to read pixels back; `dispose()` frees GPU resources when a renderer is no longer used ([threejs.org][8]).

### 3.4 Visual/E2E with Playwright (recommended for WebGL2 & browser realism)

Install:

```bash
npm i -D @playwright/test
npx playwright install
```

**`playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  use: {
    headless: true,
    // Enable GPU in headless Chromium for WebGL stability/perf in CI:
    launchOptions: { args: ['--use-gl=egl'] }, // or '--use-gl=desktop'
  },
  projects: [{ name: 'Chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

Why: enabling EGL/desktop GL removes the SwiftShader bottleneck on CI; teams report reliability/performance improvements using these flags ([Michel Krämer’s portfolio and blog][6]).

**`three.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test('canvas rendering is stable', async ({ page }) => {
  await page.goto('http://localhost:5173'); // your dev server with the scene
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveScreenshot('scene.png'); // baseline on first run
});
```

`toHaveScreenshot` is built into Playwright Test for visual diffs ([Playwright][5]).

---

## 4) Patterns for reliable, maintainable Three.js tests

- **Prefer small offscreen buffers.** Render to a tiny `WebGLRenderTarget` (e.g., 64×64) for speed and stability, then read a pixel/patch with `readRenderTargetPixels` ([threejs.org][8]).

- **Snapshot structure, not instances.** Three objects contain cycles and methods; JSON-snapshot with `object.toJSON()` and reconstruct via `ObjectLoader` when needed ([threejs.org][7]).

- **Be deterministic.** Seed `Math.random` (e.g., with `seedrandom`) for particle initializers or jittered sampling; keep camera and lights fixed.

- **Stabilize renderer output.** Fix renderer size, color space and tone mapping in tests to avoid diff noise. (E.g., set size, background, and avoid dynamic exposure.)

- **Clean up.** Call `dispose()` on `WebGLRenderer`, `WebGLRenderTarget`, `Geometry/BufferGeometry`, `Material` and `Texture`s you create. Do not render after disposing the renderer; it removes important listeners and should end its lifecycle ([threejs.org][8]).

- **jsdom gotchas.**
  - Without `canvas` (or a mock), `HTMLCanvasElement.prototype.getContext` is unimplemented and returns errors; add `canvas` or a mock package ([GitHub][3]).
  - A canvas can only have one context type; requesting `2d` first will prevent a later WebGL context on the same canvas ([MDN Web Docs][10]).

- **Know headless-gl’s limits.** WebGL2 features may not work; if you depend on them, run those tests in a real browser via Playwright ([GitHub][4]).

---

## 5) Optional: packaged mocks & visual matchers

- **`jest-webgl-canvas-mock`** (combines `jest-canvas-mock` + a WebGL mock) — good for libraries like Pixi or basic WebGL expectations when you don’t need real GPU behavior ([npm][11]).
- **`jest-image-snapshot`** — pixelmatch-based image comparator for Jest; useful when you can produce PNGs (e.g., via Playwright screenshots or `toDataURL` with `canvas`) ([GitHub][12]).

---

## 6) Example: mixing layers in one repo

**`jest.config.mjs` (projects)**
Run fast unit tests in Node, integration in jsdom+headless-gl:

```js
export default {
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/test/unit/**/*.test.(ts|js)'],
      transform: {},
    },
    {
      displayName: 'int-webgl',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/test/setup-webgl.ts'],
      testMatch: ['<rootDir>/test/integration/**/*.test.(ts|js)'],
      transform: {},
    },
  ],
};
```

---

## 7) CI notes

- **Playwright + GPU:** on Linux runners, flags like `--use-gl=egl` are often necessary; Firefox headless historically disables WebGL, so prefer Chromium for WebGL E2E in headless mode ([Michel Krämer’s portfolio and blog][6]).
- **headless-gl system deps:** Linux may need Mesa/GL dev libs; see README for required packages and hints for CI images ([GitHub][4]).

---

## 8) Quick reference links

- Jest ESM guide (how to enable, flags, mocking in ESM) ([jestjs.io][1])
- jsdom README — canvas support via `canvas` package ([GitHub][3])
- headless-gl README (WebGL in Node; WebGL1 target, WebGL2 experimental; system deps) ([GitHub][4])
- Playwright screenshot/snapshot assertions ([Playwright][5])
- `WebGLRenderer.readRenderTargetPixels` and `dispose()` docs ([threejs.org][8])
- `Object3D.toJSON` / `ObjectLoader` for serializing scene graphs ([threejs.org][7])
- jsdom “getContext” not implemented error background ([Stack Overflow][13])
- GPU flags for headless Chromium (`--use-gl=egl`/`--use-gl=desktop`) ([Michel Krämer’s portfolio and blog][6])

---

## 9) FAQ

**Can I avoid Playwright entirely?**
Yes, if your features fit WebGL1 and you’re comfortable with Node-side GL, use headless-gl and `readRenderTargetPixels`. For WebGL2 features (MRT, 3D textures, etc.) or browser-specific behavior, use Playwright (or another real-browser runner) ([GitHub][4]).

**Why not just mock everything?**
Mocking Three’s deep rendering stack drifts from reality fast. Using a real GL context (Node or browser) gives you confidence with less fragile test code.

**Why do my jsdom tests still fail around `<canvas>`?**
Install `canvas` or a dedicated mock package; by default jsdom doesn’t implement `<canvas>` APIs and `getContext` will be missing ([GitHub][3]).

---

[1]: https://jestjs.io/docs/ecmascript-modules 'ECMAScript Modules · Jest'
[2]: https://jestjs.io/docs/next/tutorial-jquery?utm_source=chatgpt.com 'DOM Manipulation'
[3]: https://github.com/jsdom/jsdom 'GitHub - jsdom/jsdom: A JavaScript implementation of various web standards, for use with Node.js'
[4]: https://github.com/stackgl/headless-gl 'GitHub - stackgl/headless-gl:  Windowless WebGL for node.js'
[5]: https://playwright.dev/docs/test-snapshots?utm_source=chatgpt.com 'Visual comparisons'
[6]: https://michelkraemer.com/enable-gpu-for-slow-playwright-tests-in-headless-mode/?utm_source=chatgpt.com 'Enable GPU to speed up slow Playwright tests in headless ...'
[7]: https://threejs.org/docs/api/en/loaders/ObjectLoader.html?utm_source=chatgpt.com 'ObjectLoader – three.js docs'
[8]: https://threejs.org/docs/?utm_source=chatgpt.com 'WebGLRenderer#readRenderTargetPixels'
[9]: https://discourse.threejs.org/t/suggestions-for-unit-testing-with-headless-gl-and-webgl-2/66891?utm_source=chatgpt.com 'Suggestions for unit testing with headless-gl and WebGL 2'
[10]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext?utm_source=chatgpt.com 'HTMLCanvasElement: getContext() method - Web APIs - MDN'
[11]: https://www.npmjs.com/package/jest-webgl-canvas-mock?utm_source=chatgpt.com 'jest-webgl-canvas-mock'
[12]: https://github.com/americanexpress/jest-image-snapshot?utm_source=chatgpt.com 'americanexpress/jest-image-snapshot'
[13]: https://stackoverflow.com/questions/48828759/unit-test-raises-error-because-of-getcontext-is-not-implemented?utm_source=chatgpt.com 'unit test raises error because of .getContext() is not ...'
