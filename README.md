# Pixel Mirror

![screenshot](./docs/app.png)

Pixel Mirror is a lightweight tool for front-end developers that overlays design mockups on web pages. With features like adjustable transparency, scaling, alignment, and grid guides, it helps developers achieve pixel-perfect accuracy when implementing UI designs.

## Installation

### 1. For [Vite](https://vite.dev/) projects

Install the package via npm:

```bash
npm install pixel-mirror --save-dev
```

Then, add Pixel Mirror's Vite plugin to your `vite.config.js`:

```js
import { defineConfig } from "vite";
import pixelMirror from "pixel-mirror/vite";

export default defineConfig({
  plugins: [pixelMirror()],
  // ... other configurations
});
```

The plugin is automatically injected into your HTML during development and will be removed in production builds.

### 2. For [Astro](https://astro.build/) projects

Install the package via npm:

```bash
npm install pixel-mirror --save-dev
```

Then, add Pixel Mirror's Astro Integration to your `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import pixelMirror from "pixel-mirror/astro";

export default defineConfig({
  integrations: [pixelMirror()],
  // ... other configurations
});
```

### 3. For [Next.js](https://nextjs.org/) projects

Inject the following code to the `<Head></Head>` section in `_document.jsx`:

``` jsx
// import Script from "next/script"

{process.env.NODE_ENV === "development" && (
  <Script
    src="https://cdn.jsdelivr.net/npm/pixel-mirror/dist/index.js"
    strategy="afterInteractive"
  />
)}
```

### 4. For other projects

Integrate Pixel Mirror by injecting its script into your HTML:

``` html
<script defer src="https://cdn.jsdelivr.net/npm/pixel-mirror/dist/index.js"></script>
```

This allows you to use Pixel Mirror out of the box without additional setup. Remember to remove the script in the production environment.

## Usage

_Before using this tool, please note that it sets the `position` of the `:root` element to `relative`. This ensures overlays work correctly with minimal impact on the host project. Be sure to verify compatibility with your project before proceeding._

For an interactive usage example, please refer to https://peiwen.lu/posts/pixel-mirror.

## Credits

Icons by https://hugeicons.com
