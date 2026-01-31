import { afterEach, describe, expect, it, vi } from "vitest";
import { settingsEventBus } from "./eventBus";

describe("settingsEventBus", () => {
  // Store unsubscribe functions to clean up after each test
  const unsubscribes: (() => void)[] = [];

  afterEach(() => {
    // Clean up all subscriptions
    unsubscribes.forEach((unsub) => unsub());
    unsubscribes.length = 0;
  });

  describe("on", () => {
    it("registers a callback for a group", () => {
      const callback = vi.fn();
      const unsub = settingsEventBus.on("dock", callback);
      unsubscribes.push(unsub);

      settingsEventBus.emit("dock", { position: "top" });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ position: "top" });
    });

    it("returns an unsubscribe function", () => {
      const callback = vi.fn();
      const unsub = settingsEventBus.on("dock", callback);

      unsub();
      settingsEventBus.emit("dock", { position: "top" });

      expect(callback).not.toHaveBeenCalled();
    });

    it("allows multiple callbacks for the same group", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      unsubscribes.push(settingsEventBus.on("dock", callback1));
      unsubscribes.push(settingsEventBus.on("dock", callback2));

      settingsEventBus.emit("dock", { theme: "dark" });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it("isolates callbacks between different groups", () => {
      const dockCallback = vi.fn();
      const gridCallback = vi.fn();

      unsubscribes.push(settingsEventBus.on("dock", dockCallback));
      unsubscribes.push(settingsEventBus.on("gridOverlay", gridCallback));

      settingsEventBus.emit("dock", { position: "bottom" });

      expect(dockCallback).toHaveBeenCalledTimes(1);
      expect(gridCallback).not.toHaveBeenCalled();
    });
  });

  describe("emit", () => {
    it("calls all registered callbacks for a group", () => {
      const callbacks = [vi.fn(), vi.fn(), vi.fn()];
      callbacks.forEach((cb) => unsubscribes.push(settingsEventBus.on("mockupOverlay", cb)));

      const settings = { opacity: 0.7 };
      settingsEventBus.emit("mockupOverlay", settings);

      callbacks.forEach((cb) => {
        expect(cb).toHaveBeenCalledWith(settings);
      });
    });

    it("does nothing when no callbacks are registered", () => {
      // Should not throw
      expect(() => {
        settingsEventBus.emit("dock", { position: "top" });
      }).not.toThrow();
    });

    it("handles callback errors gracefully", () => {
      const errorCallback = vi.fn(() => {
        throw new Error("Callback error");
      });
      const normalCallback = vi.fn();
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      unsubscribes.push(settingsEventBus.on("dock", errorCallback));
      unsubscribes.push(settingsEventBus.on("dock", normalCallback));

      // Should not throw, and should continue to call other callbacks
      expect(() => {
        settingsEventBus.emit("dock", { theme: "light" });
      }).not.toThrow();

      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("passes partial settings correctly", () => {
      const callback = vi.fn();
      unsubscribes.push(settingsEventBus.on("gridOverlay", callback));

      settingsEventBus.emit("gridOverlay", { showLayoutGrid: true });

      expect(callback).toHaveBeenCalledWith({ showLayoutGrid: true });
    });
  });

  describe("unsubscribe", () => {
    it("only removes the specific callback", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsub1 = settingsEventBus.on("dock", callback1);
      unsubscribes.push(settingsEventBus.on("dock", callback2));

      unsub1();
      settingsEventBus.emit("dock", { position: "top" });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it("can be called multiple times safely", () => {
      const callback = vi.fn();
      const unsub = settingsEventBus.on("dock", callback);

      unsub();
      unsub(); // Second call should not throw

      expect(() => unsub()).not.toThrow();
    });
  });
});
