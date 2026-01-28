# Pixel Mirror

![screenshot](./docs/app.png)

Overlay design mockups on web pages for pixel-perfect UI implementation. Features adjustable transparency, scaling, alignment, and grid guides.

## Installation

```bash
npm install pixel-mirror --save-dev
```

### Vite

```js
// vite.config.js
import pixelMirror from "pixel-mirror/vite";

export default defineConfig({
  plugins: [pixelMirror()]
});
```

### Astro

```js
// astro.config.mjs
import pixelMirror from "pixel-mirror/astro";

export default defineConfig({
  integrations: [pixelMirror()]
});
```

### Next.js

```jsx
// _document.jsx <Head>
{
  process.env.NODE_ENV === "development" && (
    <Script src="https://cdn.jsdelivr.net/npm/pixel-mirror/dist/index.js" strategy="afterInteractive" />
  );
}
```

### CDN

```html
<script defer src="https://cdn.jsdelivr.net/npm/pixel-mirror/dist/index.js"></script>
```

Remove in production.

## Note

Sets `:root { position: relative }` for overlay positioning.

## Credits

Icons by https://hugeicons.com
