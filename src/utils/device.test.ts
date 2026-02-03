import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We need to test the module fresh each time
describe("device detection", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe("isTouchDevice", () => {
    it("should return true when ontouchstart is in window", async () => {
      // Setup before importing
      Object.defineProperty(window, "ontouchstart", {
        value: vi.fn(),
        writable: true,
        configurable: true
      });

      const { isTouchDevice } = await import("./device");
      expect(isTouchDevice()).toBe(true);

      // Cleanup
      delete (window as { ontouchstart?: unknown }).ontouchstart;
    });

    it("should return true when maxTouchPoints > 0", async () => {
      // Ensure ontouchstart is not present
      delete (window as { ontouchstart?: unknown }).ontouchstart;

      // Mock maxTouchPoints
      const originalDescriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, "maxTouchPoints");
      Object.defineProperty(Navigator.prototype, "maxTouchPoints", {
        get: () => 5,
        configurable: true
      });

      const { isTouchDevice } = await import("./device");
      expect(isTouchDevice()).toBe(true);

      // Restore
      if (originalDescriptor) {
        Object.defineProperty(Navigator.prototype, "maxTouchPoints", originalDescriptor);
      }
    });

    it("should return false when neither touch indicator is present", async () => {
      // Ensure ontouchstart is not present
      delete (window as { ontouchstart?: unknown }).ontouchstart;

      // Mock maxTouchPoints to 0
      const originalDescriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, "maxTouchPoints");
      Object.defineProperty(Navigator.prototype, "maxTouchPoints", {
        get: () => 0,
        configurable: true
      });

      const { isTouchDevice } = await import("./device");
      expect(isTouchDevice()).toBe(false);

      // Restore
      if (originalDescriptor) {
        Object.defineProperty(Navigator.prototype, "maxTouchPoints", originalDescriptor);
      }
    });

    it("should cache the result after first call", async () => {
      // Setup touch device
      Object.defineProperty(window, "ontouchstart", {
        value: vi.fn(),
        writable: true,
        configurable: true
      });

      const { isTouchDevice } = await import("./device");

      // First call
      const result1 = isTouchDevice();
      expect(result1).toBe(true);

      // Change the property (but cache should still return true)
      delete (window as { ontouchstart?: unknown }).ontouchstart;

      // Second call should still return cached value
      const result2 = isTouchDevice();
      expect(result2).toBe(true); // Cached value
    });

    it("should return fresh value after resetTouchDeviceCache", async () => {
      // Setup touch device
      Object.defineProperty(window, "ontouchstart", {
        value: vi.fn(),
        writable: true,
        configurable: true
      });

      const { isTouchDevice, resetTouchDeviceCache } = await import("./device");

      expect(isTouchDevice()).toBe(true);

      // Reset cache
      resetTouchDeviceCache();

      // Change the property
      delete (window as { ontouchstart?: unknown }).ontouchstart;

      // Mock maxTouchPoints to 0
      const originalDescriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, "maxTouchPoints");
      Object.defineProperty(Navigator.prototype, "maxTouchPoints", {
        get: () => 0,
        configurable: true
      });

      // Now should return fresh value
      expect(isTouchDevice()).toBe(false);

      // Restore
      if (originalDescriptor) {
        Object.defineProperty(Navigator.prototype, "maxTouchPoints", originalDescriptor);
      }
    });
  });

  describe("input type tracking", () => {
    it("should return null initially", async () => {
      const { getLastInputType, resetInputType } = await import("./device");

      resetInputType(); // Ensure clean state
      expect(getLastInputType()).toBe(null);
    });

    it("should track touch input type", async () => {
      const { getLastInputType, isLastInputTouch, isLastInputMouse, updateInputType, resetInputType } =
        await import("./device");

      resetInputType();

      // Simulate touch input
      const touchEvent = { pointerType: "touch" } as PointerEvent;
      updateInputType(touchEvent);

      expect(getLastInputType()).toBe("touch");
      expect(isLastInputTouch()).toBe(true);
      expect(isLastInputMouse()).toBe(false);
    });

    it("should track mouse input type", async () => {
      const { getLastInputType, isLastInputTouch, isLastInputMouse, updateInputType, resetInputType } =
        await import("./device");

      resetInputType();

      // Simulate mouse input
      const mouseEvent = { pointerType: "mouse" } as PointerEvent;
      updateInputType(mouseEvent);

      expect(getLastInputType()).toBe("mouse");
      expect(isLastInputTouch()).toBe(false);
      expect(isLastInputMouse()).toBe(true);
    });

    it("should track pen input type", async () => {
      const { getLastInputType, isLastInputTouch, isLastInputMouse, updateInputType, resetInputType } =
        await import("./device");

      resetInputType();

      // Simulate pen input
      const penEvent = { pointerType: "pen" } as PointerEvent;
      updateInputType(penEvent);

      expect(getLastInputType()).toBe("pen");
      expect(isLastInputTouch()).toBe(false);
      expect(isLastInputMouse()).toBe(false);
    });

    it("should update when input type changes", async () => {
      const { getLastInputType, updateInputType, resetInputType } = await import("./device");

      resetInputType();

      // Start with touch
      updateInputType({ pointerType: "touch" } as PointerEvent);
      expect(getLastInputType()).toBe("touch");

      // Switch to mouse
      updateInputType({ pointerType: "mouse" } as PointerEvent);
      expect(getLastInputType()).toBe("mouse");

      // Switch back to touch
      updateInputType({ pointerType: "touch" } as PointerEvent);
      expect(getLastInputType()).toBe("touch");
    });

    it("should update from touch event helper", async () => {
      const { getLastInputType, updateInputTypeFromTouch, resetInputType } = await import("./device");

      resetInputType();

      updateInputTypeFromTouch();
      expect(getLastInputType()).toBe("touch");
    });

    it("should update from mouse event helper", async () => {
      const { getLastInputType, updateInputTypeFromMouse, resetInputType } = await import("./device");

      resetInputType();

      updateInputTypeFromMouse();
      expect(getLastInputType()).toBe("mouse");
    });

    it("should reset to null with resetInputType", async () => {
      const { getLastInputType, updateInputType, resetInputType } = await import("./device");

      updateInputType({ pointerType: "touch" } as PointerEvent);
      expect(getLastInputType()).toBe("touch");

      resetInputType();
      expect(getLastInputType()).toBe(null);
    });
  });

  describe("initInputTypeTracking", () => {
    let addEventListenerSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      addEventListenerSpy = vi.spyOn(document, "addEventListener");
    });

    afterEach(() => {
      addEventListenerSpy.mockRestore();
    });

    it("should attach pointerdown listener to document", async () => {
      const { initInputTypeTracking } = await import("./device");

      initInputTypeTracking();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "pointerdown",
        expect.any(Function),
        expect.objectContaining({ capture: true, passive: true })
      );
    });

    it("should not attach duplicate listeners", async () => {
      const { initInputTypeTracking } = await import("./device");

      initInputTypeTracking();
      const callCount = addEventListenerSpy.mock.calls.length;

      initInputTypeTracking();
      expect(addEventListenerSpy.mock.calls.length).toBe(callCount);
    });
  });
});
