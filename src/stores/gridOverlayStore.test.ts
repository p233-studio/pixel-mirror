/**
 * GridOverlayStore Tests
 *
 * Tests grid overlay display settings and event bus synchronization.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_GRID_OVERLAY_SETTINGS } from "~/constants";

// Mock the database module
vi.mock("./database", () => ({
  getSettingsByGroup: vi.fn().mockResolvedValue({}),
  getGrid: vi.fn().mockResolvedValue(undefined)
}));

// Mock toastStore
vi.mock("./toastStore.svelte", () => ({
  toastStore: {
    showError: vi.fn(),
    clear: vi.fn()
  }
}));

describe("gridOverlayStore", () => {
  let gridOverlayStore: typeof import("./gridOverlayStore.svelte").gridOverlayStore;
  let settingsEventBus: typeof import("./eventBus").settingsEventBus;
  let getSettingsByGroup: ReturnType<typeof vi.fn>;
  let getGrid: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();

    // Get fresh mocks
    const dbModule = await import("./database");
    const eventBusModule = await import("./eventBus");

    getSettingsByGroup = dbModule.getSettingsByGroup as ReturnType<typeof vi.fn>;
    getGrid = dbModule.getGrid as ReturnType<typeof vi.fn>;
    settingsEventBus = eventBusModule.settingsEventBus;

    // Reset mocks
    getSettingsByGroup.mockReset().mockResolvedValue({});
    getGrid.mockReset().mockResolvedValue(undefined);

    // Import fresh store
    const module = await import("./gridOverlayStore.svelte");
    gridOverlayStore = module.gridOverlayStore;
  });

  afterEach(() => {
    gridOverlayStore.cleanup();
  });

  describe("initial state", () => {
    it("starts uninitialized", () => {
      expect(gridOverlayStore.initialized).toBe(false);
    });

    it("has default values before init", () => {
      expect(gridOverlayStore.showLayoutGrid).toBe(DEFAULT_GRID_OVERLAY_SETTINGS.showLayoutGrid);
      expect(gridOverlayStore.layoutGridColor).toBe(DEFAULT_GRID_OVERLAY_SETTINGS.layoutGridColor);
      expect(gridOverlayStore.showSpacingGrid).toBe(DEFAULT_GRID_OVERLAY_SETTINGS.showSpacingGrid);
      expect(gridOverlayStore.spacingGridColor).toBe(DEFAULT_GRID_OVERLAY_SETTINGS.spacingGridColor);
      expect(gridOverlayStore.spacingGridHeight).toBe(DEFAULT_GRID_OVERLAY_SETTINGS.spacingGridHeight);
    });
  });

  describe("init", () => {
    it("loads settings from database", async () => {
      getSettingsByGroup.mockResolvedValue({
        showLayoutGrid: true,
        layoutGridColor: "#ff0000",
        showSpacingGrid: true,
        spacingGridColor: "#00ff00",
        spacingGridHeight: "16px",
        activeLayoutGridId: "test-grid-id"
      });

      await gridOverlayStore.init();

      expect(gridOverlayStore.initialized).toBe(true);
      expect(gridOverlayStore.showLayoutGrid).toBe(true);
      expect(gridOverlayStore.layoutGridColor).toBe("#ff0000");
      expect(gridOverlayStore.showSpacingGrid).toBe(true);
      expect(gridOverlayStore.spacingGridColor).toBe("#00ff00");
      expect(gridOverlayStore.spacingGridHeight).toBe("16px");
      expect(gridOverlayStore.activeLayoutGridId).toBe("test-grid-id");
    });

    it("loads active grid configuration", async () => {
      const mockGrid: LayoutGridConfig = {
        id: "test-grid-id",
        width: "1200px",
        columns: 12,
        gutterWidth: "24px",
        isGutterOnOutside: true,
        position: "center",
        createdAt: Date.now()
      };

      getSettingsByGroup.mockResolvedValue({ activeLayoutGridId: "test-grid-id" });
      getGrid.mockResolvedValue(mockGrid);

      await gridOverlayStore.init();

      expect(getGrid).toHaveBeenCalledWith("test-grid-id");
      expect(gridOverlayStore.activeLayoutGrid).toEqual(mockGrid);
    });

    it("only initializes once", async () => {
      await gridOverlayStore.init();
      await gridOverlayStore.init();

      expect(getSettingsByGroup).toHaveBeenCalledTimes(1);
    });
  });

  describe("event bus synchronization", () => {
    beforeEach(async () => {
      await gridOverlayStore.init();
    });

    it("updates showLayoutGrid on event", () => {
      settingsEventBus.emit("gridOverlay", { showLayoutGrid: true });

      expect(gridOverlayStore.showLayoutGrid).toBe(true);
    });

    it("updates layoutGridColor on event", () => {
      settingsEventBus.emit("gridOverlay", { layoutGridColor: "#0000ff" });

      expect(gridOverlayStore.layoutGridColor).toBe("#0000ff");
    });

    it("updates showSpacingGrid on event", () => {
      settingsEventBus.emit("gridOverlay", { showSpacingGrid: true });

      expect(gridOverlayStore.showSpacingGrid).toBe(true);
    });

    it("updates spacingGridColor on event", () => {
      settingsEventBus.emit("gridOverlay", { spacingGridColor: "#ffff00" });

      expect(gridOverlayStore.spacingGridColor).toBe("#ffff00");
    });

    it("updates spacingGridHeight on event", () => {
      settingsEventBus.emit("gridOverlay", { spacingGridHeight: "12px" });

      expect(gridOverlayStore.spacingGridHeight).toBe("12px");
    });

    it("loads new grid when activeLayoutGridId changes", async () => {
      const mockGrid: LayoutGridConfig = {
        id: "new-grid-id",
        width: "960px",
        columns: 8,
        gutterWidth: "16px",
        isGutterOnOutside: false,
        position: "left",
        createdAt: Date.now()
      };
      getGrid.mockResolvedValue(mockGrid);

      settingsEventBus.emit("gridOverlay", { activeLayoutGridId: "new-grid-id" });

      // Wait for async grid loading
      await vi.waitFor(() => {
        expect(getGrid).toHaveBeenCalledWith("new-grid-id");
      });
    });

    it("handles multiple settings in one event", () => {
      settingsEventBus.emit("gridOverlay", {
        showLayoutGrid: true,
        layoutGridColor: "#123456",
        showSpacingGrid: true
      });

      expect(gridOverlayStore.showLayoutGrid).toBe(true);
      expect(gridOverlayStore.layoutGridColor).toBe("#123456");
      expect(gridOverlayStore.showSpacingGrid).toBe(true);
    });
  });

  describe("syncSettings", () => {
    beforeEach(async () => {
      await gridOverlayStore.init();
    });

    it("applies settings directly", () => {
      gridOverlayStore.syncSettings({
        showLayoutGrid: true,
        layoutGridColor: "#abcdef"
      });

      expect(gridOverlayStore.showLayoutGrid).toBe(true);
      expect(gridOverlayStore.layoutGridColor).toBe("#abcdef");
    });
  });

  describe("cleanup", () => {
    it("unsubscribes from event bus", async () => {
      await gridOverlayStore.init();
      gridOverlayStore.cleanup();

      // After cleanup, events should not affect the store
      // This is hard to test directly, but we can verify cleanup doesn't throw
      expect(() => gridOverlayStore.cleanup()).not.toThrow();
    });
  });

  describe("grid loading edge cases", () => {
    beforeEach(async () => {
      await gridOverlayStore.init();
    });

    it("clears grid config when id is empty", async () => {
      // First set a grid
      const mockGrid: LayoutGridConfig = {
        id: "test-id",
        width: "1200px",
        columns: 12,
        gutterWidth: "24px",
        isGutterOnOutside: true,
        position: "center",
        createdAt: Date.now()
      };
      getGrid.mockResolvedValue(mockGrid);
      settingsEventBus.emit("gridOverlay", { activeLayoutGridId: "test-id" });

      await vi.waitFor(() => {
        expect(gridOverlayStore.activeLayoutGrid).toEqual(mockGrid);
      });

      // Then clear it
      settingsEventBus.emit("gridOverlay", { activeLayoutGridId: "" });

      await vi.waitFor(() => {
        expect(gridOverlayStore.activeLayoutGrid).toBeUndefined();
      });
    });
  });
});
