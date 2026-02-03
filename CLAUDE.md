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

---

## Coding Conventions

### Store Pattern (Svelte 5 Runes)

All stores use factory function pattern with `$state` rune:

```typescript
function createStore() {
  let value = $state(initialValue);
  let initialized = $state(false);
  let initPromise: Promise<void> | null = null;

  return {
    get value() {
      return value;
    },
    setValue(v) {
      value = v;
    },

    // Initialization pattern (prevents duplicate init)
    async init() {
      if (initialized || initPromise) return initPromise;
      initPromise = (async () => {
        // Load from database
        initialized = true;
      })();
      return initPromise;
    }
  };
}
export const store = createStore();
```

### Component Patterns

- Heavy use of `$derived` and `$derived.by()` for computed values
- Lifecycle with `onMount()` / `onDestroy()` for setup/cleanup
- Effects with `$effect()` for side effects (cleanup via return function)
- State machines for complex state (visible/locked/dragging/solid/zoomed)
- Digits-only inputs use `inputmode="numeric"` for mobile numeric keyboard; inputs that accept CSS units (e.g., `px`, `%`, `rem`) keep the default keyboard since iOS does not allow switching from numeric to full keyboard

### TypeScript Patterns

- Ambient types in `src/types.d.ts` (no import needed)
- Generic constraints: `<G extends SettingGroup>`
- Strict typing with `as const` for mode/state types
- Validation result pattern:
  ```typescript
  type ValidationResult<T> = { success: true; data: T } | { success: false; error: ValidationError };
  ```
- Error hierarchy: `ValidationError`, `FileError`, `DatabaseError`

### CSS/Styling Conventions

- SCSS with nesting and math operations
- CSS custom properties for theming (`--dock-bg`, `--text-primary`, etc.)
- Touch-optimized: `touch-action: none`, `-webkit-touch-callout: none`
- Mobile-first responsive design with `@media` queries
- Hover-dependent interactions: `@media (hover: hover)` for hover-reveal patterns; elements always visible on touch devices
- Transform optimization: `will-change: transform`, `backface-visibility: hidden`
- iOS auto-zoom prevention: inputs inside the custom element must use `font-size: 16px` on mobile to prevent Safari from zooming the page on focus (viewport meta cannot be controlled since this is injected into host pages)

### Naming Conventions

| Type              | Convention                | Examples                                    |
| ----------------- | ------------------------- | ------------------------------------------- |
| Booleans          | `is*`, `should*`, `has*`  | `isLocked`, `isDragging`, `hasActiveGrid`   |
| Handlers          | `handle*`                 | `handleMouseDown`, `handleTouchStart`       |
| Store methods     | `get*`, `set*`, `toggle*` | `getValue`, `setValue`, `toggleLock`        |
| State transitions | `enter*`, `exit*`         | `enterSolidMode`, `exitZoomedMode`          |
| Constants         | UPPER_SNAKE_CASE          | `OPACITY_DEFAULT`, `DRAG_THRESHOLD`         |
| Types             | PascalCase                | `Mockup`, `LayoutGridConfig`, `AppSettings` |

### Fire-and-Forget Pattern

Non-critical persistence operations don't await:

```typescript
// Good: UI updates immediately, persistence is fire-and-forget
opacity = newValue;
updateSetting("mockupOverlay", { opacity: newValue }); // No await

// Show toast on failure, but don't block UI
```

---

## Feature Requirements

### Mockup Overlay

#### State Machine (5 states)

| State      | Description                                       | Transitions               |
| ---------- | ------------------------------------------------- | ------------------------- |
| `visible`  | Default. Can drag, adjust opacity/scale/alignment | → locked, dragging, solid |
| `locked`   | Frozen, no interaction (except mobile double-tap) | → visible, solid          |
| `dragging` | During drag operation                             | → visible                 |
| `solid`    | Full opacity, preparing for zoom                  | → visible, locked, zoomed |
| `zoomed`   | 2x zoom with pan capability (desktop only)        | → solid                   |

**State Flow Diagrams:**

```
Desktop:
visible ←→ locked (Escape key)
visible → dragging → visible (mouse drag)
visible/locked → solid → zoomed → solid → visible/locked (Space + Click)

Mobile:
visible ←→ locked (toolbar button only)
visible → dragging → visible (touch drag)
visible/locked ←→ solid (double-tap, with pinch zoom in solid mode)
```

**State Restoration:**

- `modeBeforeSolid` tracks whether user was in `visible` or `locked` before entering solid
- When exiting solid/zoomed, restores to the previous mode
- Mobile: `preSolidScale` saves scale before solid mode for restoration on exit

---

### Hybrid Device Support

The app supports hybrid devices (touch laptops, iPad with keyboard) through:

1. **Input Type Tracking** (`src/utils/device.ts`):
   - `isTouchDevice()` - checks device capability (cached on first call)
   - `getLastInputType()` - tracks actual input method (`"touch"`, `"mouse"`, `"pen"`, or `null`)
   - `isLastInputTouch()` / `isLastInputMouse()` - convenience helpers
   - `initInputTypeTracking()` - attaches global pointerdown listener

2. **Keyboard shortcuts always enabled** - Work on all devices, including touch devices with external keyboards

3. **Pointer Events API** - MockupOverlay uses Pointer Events for mouse/pen, with Touch Events for gestures

### Mobile vs Desktop Comparison

| Feature                     | Desktop                                    | Mobile / Touch                                  |
| --------------------------- | ------------------------------------------ | ----------------------------------------------- |
| **Keyboard events**         | Full support (Space, Escape, Arrows, Ctrl) | Full support when external keyboard connected   |
| **Arrow key nudge**         | 1px per press, 10px with Shift held        | Same (with external keyboard)                   |
| **Zoomed mode**             | Supported (2x zoom with mouse pan)         | Not supported (uses pinch zoom instead)         |
| **Solid mode trigger**      | Space key (hold to enter, release to exit) | Double-tap anywhere to toggle (global handler)  |
| **Zoom in solid mode**      | Click to enter zoomed mode                 | Pinch gesture (0.25x - 4x range)                |
| **Pan in solid mode**       | Mouse move (inverse direction)             | Single finger drag (same direction as finger)   |
| **Alignment popover**       | Hover or click to open                     | Click to open, tap outside dock to close        |
| **Alignment button click**  | Three-stage cycle (see Alignment section)  | Three-stage cycle (see Alignment section)       |
| **Opacity adjust**          | Ctrl+Scroll wheel                          | Touch slide on button (100px = 50% change)      |
| **Lock toggle**             | Escape key or toolbar button               | Toolbar button (Escape works with ext keyboard) |
| **Scroll when locked**      | Native browser behavior                    | Native browser behavior (momentum scrolling)    |
| **Pointer events (locked)** | `pointer-events: auto`                     | `pointer-events: auto` (for double-tap detect)  |

#### Mobile Touch Implementation Details

**Touch Event Flow:**

```
touchstart → record position, activeTouchCount++, prepare for drag/pan
touchmove  → check DRAG_THRESHOLD (5px), then execute drag/pan/scroll
touchend   → detect double-tap (300ms window), end drag, activeTouchCount--
touchcancel → resetTouchState() (system interrupted touch)
```

**Key Constants (defined in `constants/index.ts`):**

```typescript
const DOUBLE_TAP_DELAY = 300; // ms between taps for double-tap
const DRAG_THRESHOLD = 5; // px before considering movement as drag (MockupOverlay)
const DRAG_THRESHOLD_GLOBAL = 10; // px for global double-tap detection (App.svelte)
const SCROLL_COOLDOWN = 150; // ms to wait after scroll before accepting taps
```

**Double-Tap Detection (Global - App.svelte):**

```typescript
// Handled globally in App.svelte when mockup is visible
// Triggers if ALL conditions are met:
// 1. User didn't move beyond DRAG_THRESHOLD_GLOBAL (10px)
// 2. Two taps within DOUBLE_TAP_DELAY (300ms)
// 3. Not in manager mode (mockups/grids panels)
// 4. Not scrolling (SCROLL_COOLDOWN 150ms after last scroll)
// Double-tap anywhere (dock, page, mockup) toggles solid mode
```

**Pinch Zoom Implementation:**

Two approaches used (Safari Gesture Events preferred):

1. **Safari Gesture Events** (preferred on iOS/Safari):

   ```typescript
   gesturestart  → record pinchCenter, pinchStartScale, pinchStartPosition
   gesturechange → e.scale is cumulative from start, calculate new position
   gestureend    → reset pinch state
   ```

2. **Touch Events fallback** (non-Safari browsers):
   ```typescript
   // Calculate distance between 2 touch points
   const distance = Math.sqrt(dx * dx + dy * dy);
   const scaleRatio = currentDistance / startDistance;
   const newScale = clamp(startScale * scaleRatio, 0.25, 4);
   ```

**Pinch Zoom Center Point Math:**

```typescript
// Goal: Keep the pinch center point fixed on screen as scale changes
// 1. Record pinchCenter at gesture start (in page coordinates)
// 2. Calculate the mockup point at that center:
const pointX = (pinchCenter.x - position.x) / startScale;
const pointY = (pinchCenter.y - position.y) / startScale;
// 3. As scale changes, reposition to keep that point at pinchCenter:
position.x = pinchCenter.x - pointX * newScale;
position.y = pinchCenter.y - pointY * newScale;
```

**Pan Direction Difference:**

- Desktop zoomed mode: **Inverse direction** - drag left → viewport pans right (image appears to move left)
- Mobile solid mode: **Same direction** - drag left → image follows finger left

**Locked Mode Scrolling:**

```typescript
// In locked mode on mobile:
// - pointer-events: auto (to detect double-tap for unlock)
// - touch-action: pan-x pan-y (allows native scrolling with momentum)
// - No preventDefault() called, browser handles scrolling natively
// - Only track touch movement for double-tap detection
```

**Touch Listener Lifecycle:**

```typescript
// Listeners attached only when overlay is visible
// Removed when hidden to restore browser default behavior
$effect(() => {
  if (isVisible) {
    addTouchListeners();
  } else {
    removeTouchListeners();
    resetTouchState();
  }
});
```

**Drag Start Threshold:**

```typescript
// Drag mode is NOT entered immediately on touchstart
// Only enters dragging mode when movement exceeds DRAG_THRESHOLD (5px)
// This prevents clearing alignment on simple taps
handleTouchMove: if (hasMoved && mode === "visible") {
  startTouchDrag(); // Now enters dragging mode
}
```

**Touch State Reset (called on cancel/visibility change/hide):**

```typescript
function resetTouchState() {
  activeTouchCount = 0;
  hasMoved = false;
  isGesturing = false;
  lastTapTime = 0;
  if (mode === "dragging") endTouchDrag();
  endPinch();
}
```

---

### Opacity Control

- Range: 0.1 to 0.9 (step 0.05)
- Default: 0.5
- Desktop: Click button to reset, Ctrl+Scroll to adjust (wheel listener attached when Ctrl pressed)
- Mobile: Touch slide on button (100px horizontal movement = 50% opacity change)
- Available in `visible` and `locked` modes only

### Scale

- Toolbar options: 0.5x, 1x (cycles on click)
- Desktop zoom factor: 2x (in zoomed mode, centered on click point)
- Mobile pinch range: 0.25x to 4x
- Scale change maintains viewport center point (not top-left)

### Alignment

- X-axis: `left`, `center`, `right` (nullable)
- Y-axis: `top`, `bottom` (nullable)
- Default alignment: `top center`
- Alignment cleared automatically on manual drag
- Auto-recalculates on window resize (100ms debounce)
- Position calculation uses `clientWidth` for X, `scrollHeight` for Y

**Alignment Button - Three-Stage Click Cycle:**

1. **First click**: Open alignment popover
2. **Second click**: Reset to default `top center` alignment (popover stays open)
3. **Third click**: Close popover (when already at `top center`)

Desktop can also open popover via hover; popover closes on mouse leave.
Mobile closes popover on tap outside the dock.

**Position Display:**

- Shows above the dock when alignment popover is closed
- If aligned: displays alignment as `top center`, `left`, `bottom right`, etc.
- If not aligned: displays coordinates as `x:123, y:456`

---

### Grid Overlay

- Layout grid: columns, gutters, max-width
- Spacing grid: horizontal lines at specified height
- Color customization (hex or rgba)
- Grid position: left, center, right
- CRUD: add, delete, reset to defaults
- Default template: 1140px width, 12 columns, 24px gutter

### Dock/Toolbar

#### Modes

| Mode      | Size      | Description          |
| --------- | --------- | -------------------- |
| `toolbar` | 380×44px  | Main action buttons  |
| `mockups` | 820×480px | Mockup manager panel |
| `grids`   | 640×580px | Grid manager panel   |

#### Toolbar Buttons

- Visibility toggle (show/hide mockup)
- Lock toggle
- Opacity display (click to reset)
- Alignment popover trigger
- Scale display (click to cycle)
- Mockup Manager button
- Grid Manager button
- Theme toggle (light/dark)
- Position toggle (top/bottom)

#### Behavior

- Keyboard shortcuts disabled in manager modes
- Modifier states reset on mode switch
- Position: fixed at top/bottom, centered horizontally
- Responsive: max-width calc(100vw - 16px), max-height 75vh
- Dock hidden during solid/zoomed modes

---

## Architecture

### File Structure

```
src/
├── stores/
│   ├── dockStore.svelte.ts           # UI mode/theme/position
│   ├── mockupOverlayStore.svelte.ts  # 5-state machine, drag, zoom
│   ├── gridOverlayStore.svelte.ts    # Grid display settings
│   ├── keyboardStore.svelte.ts       # Centralized keyboard handling
│   ├── mockupManagerStore.svelte.ts  # Mockup CRUD
│   ├── gridManagerStore.svelte.ts    # Grid CRUD
│   ├── toastStore.svelte.ts          # Error notifications
│   ├── database.ts                   # IndexedDB operations
│   ├── eventBus.ts                   # Pub/sub for sync
│   └── utils.ts                      # clamp, roundTo helpers
│
├── components/
│   ├── Dock.svelte                   # Toolbar + managers
│   ├── MockupOverlay.svelte          # Image + touch/mouse handlers
│   ├── GridOverlay.svelte            # Grid rendering
│   ├── GridManager.svelte            # Grid CRUD UI
│   ├── MockupManager.svelte          # Mockup CRUD UI
│   └── Toast.svelte                  # Error display
│
├── utils/
│   ├── device.ts                     # isTouchDevice detection (cached)
│   ├── errors.ts                     # Error classes, normalizeError
│   └── validation.ts                 # File/config validators
│
├── constants/
│   └── index.ts                      # Opacity, scale, grid defaults
│
├── App.svelte                        # Root custom element, theming
├── main.ts                           # Mount custom element
└── types.d.ts                        # Ambient types
```

### Path Alias

`~` maps to `src/` directory (configured in vite.config.ts and tsconfig.app.json)

### Database Schema (IndexedDB)

| Store          | Purpose                                                      |
| -------------- | ------------------------------------------------------------ |
| `mockups`      | Metadata: id, filename, mimeType, createdAt, thumbnailBuffer |
| `mockup_blobs` | Large original image ArrayBuffers (separate to avoid bloat)  |
| `grids`        | Layout grid configurations                                   |
| `settings`     | App settings grouped by category                             |

### Event Bus Pattern

Cross-store synchronization for settings:

```typescript
// After DB update
settingsEventBus.emit(group, settings);

// Subscribe to changes
settingsEventBus.on(group, callback);
```

### Keyboard Store

Centralized keyboard handling:

- Tracks modifier keys: `isControlPressed`, `isShiftPressed`, `isSpacePressed`
- Shadow DOM traversal for focus detection (`isFocusOnInputElement()`)
- Resets on window blur/visibility change
- Guards: only active in toolbar mode, skips INPUT/TEXTAREA/SELECT/contentEditable
- **Always enabled on all devices** (supports hybrid devices with external keyboards)

---

## Testing Patterns

### Test Setup

- Vitest with jsdom environment
- Testing Library for Svelte components
- `data-testid` attributes (stripped in production)
- Cleanup with `afterEach(cleanup)`

### Mocking Patterns

```typescript
// SVG icons
vi.mock("...?component", () => ({ default: () => null }));

// Stores - mock with static properties
vi.mock("~/stores/dockStore.svelte", () => ({
  dockStore: {
    mode: "toolbar",
    setMode: vi.fn()
  }
}));

// Database - mock all async functions
vi.mock("~/stores/database", () => ({
  getAllMockups: vi.fn().mockResolvedValue([]),
  deleteMockup: vi.fn().mockResolvedValue(undefined)
}));
```

### Common Assertions

- Button state (disabled, active classes)
- Display transformations (opacity 0.5 → "50%")
- Event handler calls with `toHaveBeenCalledWith()`
- Mode-dependent behavior with state variations

---

## Key Technical Decisions

1. **Separate blob storage**: Large image buffers in dedicated store to avoid metadata bloat
2. **Fire-and-forget persistence**: Settings updates don't block UI (recovery via next session)
3. **Dynamic touch-action on overlay**: `none` in visible/solid modes (JS handles all gestures), `pan-x pan-y` in locked mode (native scrolling with momentum)
4. **Safari Gesture Events preference**: Better UX on iOS, Touch Events as fallback
5. **5-state machine for overlay**: Eliminates complexity, prevents invalid transitions
6. **Event bus + local updates**: Immediate UX (local state), consistency via event bus
7. **Cached touch detection**: `isTouchDevice()` checks capability, `getLastInputType()` tracks actual input
8. **Centralized keyboard handling**: Single store prevents component conflicts, enabled on all devices
9. **No zoomed mode on mobile**: Pinch zoom replaces click-to-zoom for natural touch UX
10. **Pan direction differs by platform**: Desktop pans viewport (inverse), mobile follows finger (same)
11. **Conditional document-level zoom prevention**: App.svelte sets `touch-action: pan-x pan-y` on document element only when mockup overlay is visible, allowing normal browser zoom when mockup is hidden
12. **Global double-tap handling**: When mockup is visible, double-tap anywhere on the page (including dock) toggles solid mode - handled in App.svelte to ensure consistent behavior everywhere
13. **Drag threshold for alignment preservation**: Touch drag only starts when movement exceeds DRAG_THRESHOLD (5px), preventing simple taps from clearing alignment
14. **Pointer Events API for mouse/pen**: MockupOverlay uses Pointer Events for unified mouse/pen handling, Touch Events for gestures
15. **Hybrid device support**: Keyboard shortcuts always enabled; hover behavior uses `isLastInputTouch()` to avoid conflicts
16. **UUID generation for insecure contexts**: `crypto.randomUUID()` requires HTTPS or localhost; mobile devices access the dev server via LAN IP (HTTP), so `database.ts` uses a `generateId()` helper that falls back to `crypto.getRandomValues()` for UUID v4 generation

---

## Edge Cases Handled

| Scenario                       | Handling                                                                                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab hidden (visibility change) | Reset modifiers, cleanup drag state, reset touch                                                                                                   |
| Window blur                    | Reset keyboard state                                                                                                                               |
| Resize during alignment        | Debounced update (100ms)                                                                                                                           |
| Deleted active mockup          | Clear activeId, hide overlay                                                                                                                       |
| Deleted active grid            | Switch to next or create default                                                                                                                   |
| Double-tap vs drag             | DRAG_THRESHOLD (10px in global handler) distinguishes                                                                                              |
| Double-tap after scroll        | SCROLL_COOLDOWN (150ms) prevents accidental trigger                                                                                                |
| Gesture in progress            | `isGesturing` flag prevents pan during pinch                                                                                                       |
| Focus on input                 | Skip keyboard shortcuts                                                                                                                            |
| Browser double-tap zoom        | Disabled via `touch-action: pan-x pan-y` on document when mockup visible; enabled when hidden                                                      |
| Browser pinch zoom             | Disabled when mockup visible (pinch in solid mode handled by JS); enabled when hidden                                                              |
| Dock pinch zoom/text selection | Disabled via `touch-action: pan-x pan-y` and `user-select: none` on dock elements                                                                  |
| Tap on mockup clears alignment | Only cleared when actual drag (movement > 5px threshold), not on simple taps                                                                       |
| Touch cancel (system alert)    | `resetTouchState()` cleans up all touch state                                                                                                      |
| Mockup load error              | Show toast, clear metadata, reset size to 0                                                                                                        |
| Non-secure context (HTTP LAN)  | `generateId()` falls back to `crypto.getRandomValues()` when `crypto.randomUUID()` unavailable                                                     |
| iOS Safari auto-zoom on focus  | Inputs use `font-size: 16px` on mobile; viewport meta unavailable in custom element context                                                        |
| Mobile hover double-tap issue  | Interactive elements (e.g., delete buttons) use `@media (hover: hover)` for hover-reveal; always visible on touch devices to avoid two-tap problem |

---

## Framework Integrations

- `plugins/vite.js` - Vite plugin that injects script tag in dev mode
- `plugins/astro.js` - Astro integration wrapper
