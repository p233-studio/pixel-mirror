# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pixel Mirror is a developer tool for overlaying design mockups on web pages. It's built as a Svelte 5 custom element (`<pixel-mirror>`) that gets injected into host pages during development. The tool supports mockup overlays with transparency/scaling/alignment and layout/spacing grid overlays.

## Commands

```bash
pnpm dev          # Start dev server on port 3000
pnpm build        # Build library to dist/index.js (IIFE format)
pnpm check        # Run svelte-check and TypeScript type checking
pnpm lint         # Run ESLint and Stylelint
pnpm test         # Run tests in watch mode
pnpm test:run     # Run tests once
pnpm test -- src/stores/dockStore.test.ts  # Run single test file
```

## Architecture

### Entry Point & Custom Element

- `src/main.ts` - Creates `<pixel-mirror>` custom element and appends to body
- `src/App.svelte` - Root component with `customElement: "pixel-mirror"` option, defines CSS custom properties for light/dark themes

### Store Pattern (Svelte 5 Runes)

Stores use Svelte 5's `$state` rune pattern with factory functions:

```typescript
function createStore() {
  let value = $state(initialValue);
  return {
    get value() {
      return value;
    },
    setValue(v) {
      value = v;
    }
  };
}
export const store = createStore();
```

Key stores:

- `dockStore.svelte.ts` - Dock UI state machine (toolbar/mockups/grids modes)
- `mockupOverlayStore.svelte.ts` - Mockup overlay state machine (visible/locked/dragging/solid/zoomed)
- `gridOverlayStore.svelte.ts` - Grid overlay settings, subscribes to eventBus
- `keyboardStore.svelte.ts` - Keyboard event handling

### Database Layer

- `src/stores/database.ts` - IndexedDB operations using `idb` library
- Stores: `mockups`, `mockup_blobs` (separate for large ArrayBuffers), `grids`, `settings`
- Settings changes emit events via `eventBus.ts` for cross-store synchronization

### Framework Integrations

- `plugins/vite.js` - Vite plugin that injects script tag in dev mode
- `plugins/astro.js` - Astro integration wrapper

### Path Alias

`~` maps to `src/` directory (configured in vite.config.ts and tsconfig.app.json)

### Testing

- Uses Vitest with jsdom environment
- Testing Library for Svelte components
- Mock database in `src/stores/__mocks__/database.ts`
- `data-testid` attributes are stripped in production builds (vite.config.ts removeTestIds plugin)

### Types

- Global types in `src/types.d.ts` (Mockup, LayoutGridConfig, AppSettings, etc.)
- No import needed - types are ambient
