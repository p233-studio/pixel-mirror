/**
 * Device and Input Detection Utilities
 *
 * Provides two levels of detection:
 * 1. Device capability detection (isTouchDevice) - checks if device supports touch
 * 2. Input type tracking (lastInputType) - tracks actual input method being used
 *
 * This allows proper support for hybrid devices (touch laptops, iPad with keyboard)
 * where both touch and keyboard/mouse are available.
 */

let cachedIsTouchDevice: boolean | null = null;

/**
 * Detects if the current device supports touch input.
 * Uses feature detection rather than User Agent for reliability.
 * Result is cached on first call.
 *
 * Note: This detects capability, not current input method.
 * Use lastInputType for tracking actual input being used.
 */
export function isTouchDevice(): boolean {
  if (cachedIsTouchDevice === null) {
    cachedIsTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }
  return cachedIsTouchDevice;
}

/**
 * Resets the cached touch device detection.
 * Useful for testing purposes.
 */
export function resetTouchDeviceCache(): void {
  cachedIsTouchDevice = null;
}

// ============================================
// Input Type Tracking
// ============================================

export type InputType = "touch" | "mouse" | "pen" | null;

let lastInputType: InputType = null;
let inputTypeListenersAttached = false;

/**
 * Returns the last detected input type.
 * Returns null if no input has been detected yet.
 */
export function getLastInputType(): InputType {
  return lastInputType;
}

/**
 * Checks if the last input was a touch event.
 * Returns false if no input detected yet or last input was mouse/pen.
 */
export function isLastInputTouch(): boolean {
  return lastInputType === "touch";
}

/**
 * Checks if the last input was a mouse event.
 * Returns false if no input detected yet or last input was touch/pen.
 */
export function isLastInputMouse(): boolean {
  return lastInputType === "mouse";
}

/**
 * Updates the last input type from a PointerEvent.
 * Call this at the start of pointer event handlers.
 */
export function updateInputType(e: PointerEvent): void {
  lastInputType = e.pointerType as InputType;
}

/**
 * Updates the last input type from a TouchEvent.
 * Call this at the start of touch event handlers.
 */
export function updateInputTypeFromTouch(): void {
  lastInputType = "touch";
}

/**
 * Updates the last input type from a MouseEvent.
 * Call this at the start of mouse event handlers.
 */
export function updateInputTypeFromMouse(): void {
  lastInputType = "mouse";
}

/**
 * Initialize global input type tracking.
 * Attaches listeners to document to track pointer events.
 * Call once at app startup.
 */
export function initInputTypeTracking(): void {
  if (inputTypeListenersAttached) return;

  // Use pointerdown to detect input type as early as possible
  document.addEventListener(
    "pointerdown",
    (e: PointerEvent) => {
      lastInputType = e.pointerType as InputType;
    },
    { capture: true, passive: true }
  );

  inputTypeListenersAttached = true;
}

/**
 * Resets input type tracking state.
 * Useful for testing purposes.
 */
export function resetInputType(): void {
  lastInputType = null;
}
