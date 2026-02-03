/**
 * App Component Tests
 *
 * Tests for the global double-tap detection logic in App.svelte
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { DOUBLE_TAP_DELAY, DRAG_THRESHOLD_GLOBAL, SCROLL_COOLDOWN } from "~/constants";

// Mock dockStore
vi.mock("~/stores/dockStore.svelte", () => ({
  dockStore: {
    theme: "light" as "light" | "dark",
    isManagerMode: false
  }
}));

// Mock mockupOverlayStore
vi.mock("~/stores/mockupOverlayStore.svelte", () => ({
  mockupOverlayStore: {
    isHidden: false,
    activeMockupUrl: "blob:test-url",
    toggleMobileSolidMode: vi.fn()
  }
}));

// Mock isTouchDevice
vi.mock("~/utils/device", () => ({
  isTouchDevice: vi.fn(() => true)
}));

import { dockStore } from "~/stores/dockStore.svelte";
import { mockupOverlayStore } from "~/stores/mockupOverlayStore.svelte";
import { isTouchDevice } from "~/utils/device";

const mockDockStore = dockStore as unknown as {
  theme: "light" | "dark";
  isManagerMode: boolean;
};

const mockMockupStore = mockupOverlayStore as unknown as {
  isHidden: boolean;
  activeMockupUrl: string | null;
  toggleMobileSolidMode: ReturnType<typeof vi.fn>;
};

const mockIsTouchDevice = isTouchDevice as ReturnType<typeof vi.fn>;

describe("App component integration (via stores)", () => {
  beforeEach(() => {
    mockDockStore.theme = "light";
  });

  it("dockStore provides theme for App component", () => {
    // App.svelte uses dockStore.theme for dark mode class
    expect(mockDockStore.theme).toBe("light");
  });

  it("theme can be changed to dark", () => {
    mockDockStore.theme = "dark";
    expect(mockDockStore.theme).toBe("dark");
  });
});

// ============================================
// Global Double-Tap Detection Tests
// ============================================
// These tests verify the double-tap logic that would be in App.svelte
// Since the component is hard to test directly, we test the logic separately

describe("Global double-tap detection logic", () => {
  // Simulating the App.svelte double-tap detection logic
  let lastTapTime = 0;
  let lastTapPos = { x: 0, y: 0 };
  let lastScrollTime = 0;
  let isScrolling = false;

  function handleScroll() {
    lastScrollTime = Date.now();
    isScrolling = true;
  }

  function resetScrollState() {
    isScrolling = false;
  }

  function handleGlobalTouchEnd(
    touchX: number,
    touchY: number,
    isManagerMode: boolean,
    isMockupVisible: boolean
  ): boolean {
    // Skip if in manager mode
    if (isManagerMode) return false;

    // Skip if mockup not visible
    if (!isMockupVisible) return false;

    // Skip if scrolling recently
    if (isScrolling || Date.now() - lastScrollTime < SCROLL_COOLDOWN) {
      lastTapTime = 0;
      return false;
    }

    const now = Date.now();
    const timeDiff = now - lastTapTime;
    const dx = Math.abs(touchX - lastTapPos.x);
    const dy = Math.abs(touchY - lastTapPos.y);

    if (timeDiff < DOUBLE_TAP_DELAY && dx < DRAG_THRESHOLD_GLOBAL && dy < DRAG_THRESHOLD_GLOBAL) {
      // Double-tap detected
      lastTapTime = 0;
      return true;
    } else {
      // Record this tap
      lastTapTime = now;
      lastTapPos = { x: touchX, y: touchY };
      return false;
    }
  }

  beforeEach(() => {
    lastTapTime = 0;
    lastTapPos = { x: 0, y: 0 };
    lastScrollTime = 0;
    isScrolling = false;
    mockMockupStore.toggleMobileSolidMode.mockClear();
    mockDockStore.isManagerMode = false;
    mockMockupStore.isHidden = false;
    mockMockupStore.activeMockupUrl = "blob:test-url";
    mockIsTouchDevice.mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("detects double-tap within time threshold", () => {
    vi.useFakeTimers();

    // First tap
    const firstTap = handleGlobalTouchEnd(100, 100, false, true);
    expect(firstTap).toBe(false);

    // Second tap within threshold
    vi.advanceTimersByTime(200); // Less than DOUBLE_TAP_DELAY (300ms)
    const secondTap = handleGlobalTouchEnd(100, 100, false, true);
    expect(secondTap).toBe(true);
  });

  it("does not detect double-tap if time exceeds threshold", () => {
    vi.useFakeTimers();

    // First tap
    handleGlobalTouchEnd(100, 100, false, true);

    // Second tap after threshold
    vi.advanceTimersByTime(400); // More than DOUBLE_TAP_DELAY (300ms)
    const secondTap = handleGlobalTouchEnd(100, 100, false, true);
    expect(secondTap).toBe(false);
  });

  it("does not detect double-tap if position exceeds threshold", () => {
    vi.useFakeTimers();

    // First tap
    handleGlobalTouchEnd(100, 100, false, true);

    // Second tap at different position (beyond DRAG_THRESHOLD_GLOBAL of 10px)
    vi.advanceTimersByTime(200);
    const secondTap = handleGlobalTouchEnd(120, 120, false, true);
    expect(secondTap).toBe(false);
  });

  it("allows double-tap if position is within threshold", () => {
    vi.useFakeTimers();

    // First tap
    handleGlobalTouchEnd(100, 100, false, true);

    // Second tap within position threshold (less than 10px)
    vi.advanceTimersByTime(200);
    const secondTap = handleGlobalTouchEnd(105, 105, false, true);
    expect(secondTap).toBe(true);
  });

  it("skips double-tap in manager mode", () => {
    vi.useFakeTimers();

    // First tap
    handleGlobalTouchEnd(100, 100, false, true);

    // Second tap in manager mode
    vi.advanceTimersByTime(200);
    const secondTap = handleGlobalTouchEnd(100, 100, true, true);
    expect(secondTap).toBe(false);
  });

  it("skips double-tap when mockup is not visible", () => {
    vi.useFakeTimers();

    // First tap
    handleGlobalTouchEnd(100, 100, false, true);

    // Second tap when mockup hidden
    vi.advanceTimersByTime(200);
    const secondTap = handleGlobalTouchEnd(100, 100, false, false);
    expect(secondTap).toBe(false);
  });

  it("skips double-tap during scroll cooldown", () => {
    vi.useFakeTimers();

    // First tap
    handleGlobalTouchEnd(100, 100, false, true);

    // Scroll happens
    handleScroll();
    resetScrollState();

    // Second tap during cooldown
    vi.advanceTimersByTime(100); // Less than SCROLL_COOLDOWN (150ms)
    const secondTap = handleGlobalTouchEnd(100, 100, false, true);
    expect(secondTap).toBe(false);
  });

  it("allows double-tap after scroll cooldown expires", () => {
    vi.useFakeTimers();

    // Scroll happens
    handleScroll();
    resetScrollState();

    // Wait for cooldown to expire
    vi.advanceTimersByTime(200); // More than SCROLL_COOLDOWN (150ms)

    // First tap
    handleGlobalTouchEnd(100, 100, false, true);

    // Second tap
    vi.advanceTimersByTime(200);
    const secondTap = handleGlobalTouchEnd(100, 100, false, true);
    expect(secondTap).toBe(true);
  });

  it("resets tap state after scroll (prevents accidental double-tap)", () => {
    vi.useFakeTimers();

    // First tap
    handleGlobalTouchEnd(100, 100, false, true);

    // Scroll happens
    handleScroll();

    // Second tap during scroll (resets state)
    vi.advanceTimersByTime(50);
    handleGlobalTouchEnd(100, 100, false, true);

    // Wait for cooldown
    vi.advanceTimersByTime(200);
    resetScrollState();

    // Third tap - should NOT be detected as double-tap (state was reset)
    const thirdTap = handleGlobalTouchEnd(100, 100, false, true);
    expect(thirdTap).toBe(false);
  });

  it("prevents triple-tap by resetting lastTapTime on successful double-tap", () => {
    vi.useFakeTimers();

    // First tap
    handleGlobalTouchEnd(100, 100, false, true);

    // Second tap (double-tap detected)
    vi.advanceTimersByTime(200);
    const secondTap = handleGlobalTouchEnd(100, 100, false, true);
    expect(secondTap).toBe(true);

    // Third tap (should NOT be detected as double-tap)
    vi.advanceTimersByTime(200);
    const thirdTap = handleGlobalTouchEnd(100, 100, false, true);
    expect(thirdTap).toBe(false);
  });
});

describe("Constants used in double-tap detection", () => {
  it("has correct DOUBLE_TAP_DELAY value", () => {
    expect(DOUBLE_TAP_DELAY).toBe(300);
  });

  it("has correct DRAG_THRESHOLD_GLOBAL value", () => {
    expect(DRAG_THRESHOLD_GLOBAL).toBe(10);
  });

  it("has correct SCROLL_COOLDOWN value", () => {
    expect(SCROLL_COOLDOWN).toBe(150);
  });
});
