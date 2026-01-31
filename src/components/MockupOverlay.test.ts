/**
 * MockupOverlay Component Tests
 */

import { cleanup, render } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MockupOverlay from "./MockupOverlay.svelte";
import { mockupOverlayStore } from "~/stores/mockupOverlayStore.svelte";
import { dockStore } from "~/stores/dockStore.svelte";
import { keyboardStore } from "~/stores/keyboardStore.svelte";

// Mock stores
vi.mock("~/stores/mockupOverlayStore.svelte", () => ({
  mockupOverlayStore: {
    isHidden: false,
    activeMockupUrl: "blob:test-url",
    position: { x: 100, y: 200 },
    scale: 1,
    opacity: 0.5,
    effectiveOpacity: 0.5,
    mode: "visible" as "visible" | "locked" | "dragging" | "solid" | "zoomed",
    isLocked: false,
    isDragging: false,
    isZoomPanning: false,
    isAligned: false,
    init: vi.fn(),
    cleanup: vi.fn(),
    startDrag: vi.fn(),
    enterZoomMode: vi.fn(),
    exitZoomMode: vi.fn(),
    updateAlignedPosition: vi.fn()
  }
}));

vi.mock("~/stores/dockStore.svelte", () => ({
  dockStore: {
    mode: "toolbar" as "toolbar" | "mockups" | "grids"
  }
}));

vi.mock("~/stores/keyboardStore.svelte", () => ({
  keyboardStore: {
    init: vi.fn(),
    cleanup: vi.fn()
  }
}));

// Get typed references to mocks (use `as unknown as` to bypass type checking for mocked modules)
const mockMockupStore = mockupOverlayStore as unknown as {
  isHidden: boolean;
  activeMockupUrl: string | undefined;
  position: { x: number; y: number };
  scale: number;
  opacity: number;
  effectiveOpacity: number;
  mode: "visible" | "locked" | "dragging" | "solid" | "zoomed";
  isLocked: boolean;
  isDragging: boolean;
  isZoomPanning: boolean;
  isAligned: boolean;
  init: ReturnType<typeof vi.fn>;
  cleanup: ReturnType<typeof vi.fn>;
  startDrag: ReturnType<typeof vi.fn>;
  enterZoomMode: ReturnType<typeof vi.fn>;
  exitZoomMode: ReturnType<typeof vi.fn>;
  updateAlignedPosition: ReturnType<typeof vi.fn>;
};

const mockDockStore = dockStore as unknown as {
  mode: "toolbar" | "mockups" | "grids";
};

const mockKeyboardStore = keyboardStore as unknown as {
  init: ReturnType<typeof vi.fn>;
  cleanup: ReturnType<typeof vi.fn>;
};

describe("MockupOverlay component", () => {
  beforeEach(() => {
    // Reset mock values
    mockMockupStore.isHidden = false;
    mockMockupStore.activeMockupUrl = "blob:test-url";
    mockMockupStore.position = { x: 100, y: 200 };
    mockMockupStore.scale = 1;
    mockMockupStore.opacity = 0.5;
    mockMockupStore.effectiveOpacity = 0.5;
    mockMockupStore.mode = "visible";
    mockMockupStore.isLocked = false;
    mockMockupStore.isDragging = false;
    mockMockupStore.isZoomPanning = false;
    mockMockupStore.isAligned = false;
    mockMockupStore.init.mockClear();
    mockMockupStore.cleanup.mockClear();
    mockMockupStore.startDrag.mockClear();
    mockMockupStore.enterZoomMode.mockClear();
    mockMockupStore.exitZoomMode.mockClear();
    mockDockStore.mode = "toolbar";
    mockKeyboardStore.init.mockClear();
    mockKeyboardStore.cleanup.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  describe("conditional rendering", () => {
    it("renders .mockup-container when visible and has url", () => {
      mockMockupStore.isHidden = false;
      mockMockupStore.activeMockupUrl = "blob:test-url";
      const { container } = render(MockupOverlay);

      expect(container.querySelector(".mockup-container")).toBeInTheDocument();
    });

    it("does not render when isHidden is true", () => {
      mockMockupStore.isHidden = true;
      const { container } = render(MockupOverlay);

      expect(container.querySelector(".mockup-container")).toBeNull();
    });

    it("does not render when activeMockupUrl is undefined", () => {
      mockMockupStore.activeMockupUrl = undefined;
      const { container } = render(MockupOverlay);

      expect(container.querySelector(".mockup-container")).toBeNull();
    });
  });

  describe("style bindings", () => {
    it("applies transform with position and scale", () => {
      mockMockupStore.position = { x: 150, y: 250 };
      mockMockupStore.scale = 0.5;
      const { container } = render(MockupOverlay);

      const img = container.querySelector(".mockup-overlay") as HTMLElement;
      expect(img.style.transform).toContain("150px");
      expect(img.style.transform).toContain("250px");
      expect(img.style.transform).toContain("0.5");
    });

    it("applies opacity from effectiveOpacity", () => {
      mockMockupStore.effectiveOpacity = 0.75;
      const { container } = render(MockupOverlay);

      const img = container.querySelector(".mockup-overlay") as HTMLElement;
      expect(img.style.opacity).toBe("0.75");
    });

    it("applies cursor grab in visible mode", () => {
      mockMockupStore.mode = "visible";
      mockMockupStore.isLocked = false;
      const { container } = render(MockupOverlay);

      const img = container.querySelector(".mockup-overlay") as HTMLElement;
      expect(img.style.cursor).toBe("grab");
    });

    it("applies cursor grabbing in dragging mode", () => {
      mockMockupStore.mode = "dragging";
      mockMockupStore.isLocked = false;
      const { container } = render(MockupOverlay);

      const img = container.querySelector(".mockup-overlay") as HTMLElement;
      expect(img.style.cursor).toBe("grabbing");
    });

    it("applies cursor zoom-in in solid mode", () => {
      mockMockupStore.mode = "solid";
      mockMockupStore.isLocked = false;
      const { container } = render(MockupOverlay);

      const img = container.querySelector(".mockup-overlay") as HTMLElement;
      expect(img.style.cursor).toBe("zoom-in");
    });

    it("applies cursor zoom-out in zoomed mode", () => {
      mockMockupStore.mode = "zoomed";
      mockMockupStore.isLocked = false;
      const { container } = render(MockupOverlay);

      const img = container.querySelector(".mockup-overlay") as HTMLElement;
      expect(img.style.cursor).toBe("zoom-out");
    });

    it("applies cursor default when locked", () => {
      mockMockupStore.isLocked = true;
      const { container } = render(MockupOverlay);

      const img = container.querySelector(".mockup-overlay") as HTMLElement;
      expect(img.style.cursor).toBe("default");
    });

    it("applies transition none when dragging", () => {
      mockMockupStore.isDragging = true;
      const { container } = render(MockupOverlay);

      const img = container.querySelector(".mockup-overlay") as HTMLElement;
      expect(img.style.transition).toBe("none");
    });

    it("applies transition none when zoom panning", () => {
      mockMockupStore.isZoomPanning = true;
      const { container } = render(MockupOverlay);

      const img = container.querySelector(".mockup-overlay") as HTMLElement;
      expect(img.style.transition).toBe("none");
    });

    it("applies pointer-events none when locked", () => {
      mockMockupStore.isLocked = true;
      const { container } = render(MockupOverlay);

      const img = container.querySelector(".mockup-overlay") as HTMLElement;
      expect(img.style.pointerEvents).toBe("none");
    });
  });

  describe("lifecycle", () => {
    it("calls mockupOverlayStore.init() on mount", () => {
      render(MockupOverlay);

      expect(mockMockupStore.init).toHaveBeenCalledTimes(1);
    });

    it("calls keyboardStore.init() on mount", () => {
      render(MockupOverlay);

      expect(mockKeyboardStore.init).toHaveBeenCalledTimes(1);
    });

    it("calls mockupOverlayStore.cleanup() on destroy", () => {
      const { unmount } = render(MockupOverlay);
      unmount();

      expect(mockMockupStore.cleanup).toHaveBeenCalledTimes(1);
    });

    it("calls keyboardStore.cleanup() on destroy", () => {
      const { unmount } = render(MockupOverlay);
      unmount();

      expect(mockKeyboardStore.cleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe("mouse events", () => {
    it("calls startDrag with MouseEvent on mousedown in visible mode", () => {
      mockMockupStore.mode = "visible";
      mockDockStore.mode = "toolbar";
      const { container } = render(MockupOverlay);

      const img = container.querySelector(".mockup-overlay") as HTMLElement;
      img.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

      expect(mockMockupStore.startDrag).toHaveBeenCalledTimes(1);
      expect(mockMockupStore.startDrag).toHaveBeenCalledWith(expect.any(MouseEvent));
    });

    it("calls enterZoomMode with MouseEvent on mousedown in solid mode", () => {
      mockMockupStore.mode = "solid";
      mockDockStore.mode = "toolbar";
      const { container } = render(MockupOverlay);

      const img = container.querySelector(".mockup-overlay") as HTMLElement;
      img.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

      expect(mockMockupStore.enterZoomMode).toHaveBeenCalledTimes(1);
      expect(mockMockupStore.enterZoomMode).toHaveBeenCalledWith(expect.any(MouseEvent));
    });

    it("calls exitZoomMode on mousedown in zoomed mode", () => {
      mockMockupStore.mode = "zoomed";
      mockDockStore.mode = "toolbar";
      const { container } = render(MockupOverlay);

      const img = container.querySelector(".mockup-overlay") as HTMLElement;
      img.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

      expect(mockMockupStore.exitZoomMode).toHaveBeenCalledTimes(1);
    });

    it("does not handle mousedown when dock is not in toolbar mode", () => {
      mockMockupStore.mode = "visible";
      mockDockStore.mode = "mockups";
      const { container } = render(MockupOverlay);

      const img = container.querySelector(".mockup-overlay") as HTMLElement;
      img.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

      expect(mockMockupStore.startDrag).not.toHaveBeenCalled();
    });

    it("does not call startDrag on click event (must be mousedown)", () => {
      mockMockupStore.mode = "visible";
      mockDockStore.mode = "toolbar";
      const { container } = render(MockupOverlay);

      const img = container.querySelector(".mockup-overlay") as HTMLElement;
      // Only dispatch click, not mousedown
      img.dispatchEvent(new MouseEvent("click", { bubbles: true }));

      // startDrag should not be called on click alone
      expect(mockMockupStore.startDrag).not.toHaveBeenCalled();
    });
  });
});
