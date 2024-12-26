# Pixel Mirror

![screenshot](./docs/app.png)

Pixel Mirror is a lightweight tool for front-end developers that overlays design mockups on web pages. With features like adjustable transparency, scaling, alignment, and grid guides, it helps developers achieve pixel-perfect accuracy when implementing UI designs.

## Installation

### 1. For Vite projects

Install the package via npm:

```bash
npm install pixel-mirror --save-dev
```

Then, add Pixel Mirror's Vite plugin to your `vite.config.js`:

```js
import pixelMirrorPlugin from "pixel-mirror/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [pixelMirrorPlugin()],
  // ... other configurations
});
```

The plugin is automatically injected into your HTML during development and will be removed in production builds.

### 2. For other projects

If you're not using Vite, you can integrate Pixel Mirror by injecting its script file into your HTML, served via a CDN:

``` html
<script type="module" src="https://cdn.jsdelivr.net/npm/piexl-mirror/dist/index.js"></script>
```

This allows you to use Pixel Mirror out of the box without additional setup. Remember to remove the script in the production environment.

## Usage

_Before using this tool, please note that it sets the `position` of the `:root` element to `relative`. This ensures overlays work correctly with minimal impact on the host project. Be sure to verify compatibility with your project before proceeding._

For an interactive usage example, please refer to https://peiwen.lu/posts/pixel-mirror.

## Credits

Icons by https://hugeicons.com
