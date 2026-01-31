/**
 * DockStore Tests
 *
 * Tests the dock UI state machine with three modes:
 * - toolbar: Main toolbar with quick actions
 * - mockups: Mockup manager panel
 * - grids: Grid manager panel
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database module
vi.mock("./database", () => ({
  getSettingsByGroup: vi.fn().mockResolvedValue({}),
  updateSetting: vi.fn().mockResolvedValue(undefined)
}));

// Mock keyboardStore
vi.mock("./keyboardStore.svelte", () => ({
  keyboardStore: {
    resetModifierStates: vi.fn()
  }
}));

// Mock toastStore
vi.mock("./toastStore.svelte", () => ({
  toastStore: {
    showError: vi.fn(),
    clear: vi.fn()
  }
}));

describe("dockStore", () => {
  let dockStore: typeof import("./dockStore.svelte").dockStore;
  let getSettingsByGroup: ReturnType<typeof vi.fn>;
  let updateSetting: ReturnType<typeof vi.fn>;
  let keyboardStore: { resetModifierStates: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.resetModules();

    // Get fresh mocks
    const dbModule = await import("./database");
    const kbModule = await import("./keyboardStore.svelte");

    getSettingsByGroup = dbModule.getSettingsByGroup as ReturnType<typeof vi.fn>;
    updateSetting = dbModule.updateSetting as ReturnType<typeof vi.fn>;
    keyboardStore = kbModule.keyboardStore as unknown as { resetModifierStates: ReturnType<typeof vi.fn> };

    // Reset mocks
    getSettingsByGroup.mockReset().mockResolvedValue({});
    updateSetting.mockReset().mockResolvedValue(undefined);
    keyboardStore.resetModifierStates.mockReset();

    // Import fresh store
    const module = await import("./dockStore.svelte");
    dockStore = module.dockStore;
  });

  describe("initial state", () => {
    it("starts uninitialized", () => {
      expect(dockStore.initialized).toBe(false);
    });

    it("has default values before init", () => {
      expect(dockStore.mode).toBe("toolbar");
      expect(dockStore.position).toBe("bottom");
      expect(dockStore.theme).toBe("light");
      expect(dockStore.managerVisible).toBe(false);
      expect(dockStore.toolbarVisible).toBe(true);
    });
  });

  describe("init", () => {
    it("loads settings from database", async () => {
      getSettingsByGroup.mockResolvedValue({
        position: "top",
        theme: "dark"
      });

      await dockStore.init();

      expect(dockStore.initialized).toBe(true);
      expect(dockStore.position).toBe("top");
      expect(dockStore.theme).toBe("dark");
    });

    it("only initializes once", async () => {
      await dockStore.init();
      await dockStore.init();

      expect(getSettingsByGroup).toHaveBeenCalledTimes(1);
    });

    it("keeps defaults when no settings in database", async () => {
      getSettingsByGroup.mockResolvedValue({});

      await dockStore.init();

      expect(dockStore.position).toBe("bottom");
      expect(dockStore.theme).toBe("light");
    });
  });

  describe("mode transitions", () => {
    beforeEach(async () => {
      await dockStore.init();
    });

    describe("enterToolbar", () => {
      it("sets mode to toolbar", () => {
        dockStore.enterMockups();
        dockStore.enterToolbar();

        expect(dockStore.mode).toBe("toolbar");
      });

      it("hides manager and shows toolbar", () => {
        dockStore.managerVisible = true;
        dockStore.toolbarVisible = false;

        dockStore.enterToolbar();

        expect(dockStore.managerVisible).toBe(false);
        expect(dockStore.toolbarVisible).toBe(true);
      });

      it("resets keyboard modifier states", () => {
        dockStore.enterToolbar();

        expect(keyboardStore.resetModifierStates).toHaveBeenCalled();
      });
    });

    describe("enterMockups", () => {
      it("sets mode to mockups", () => {
        dockStore.enterMockups();

        expect(dockStore.mode).toBe("mockups");
      });

      it("hides toolbar and manager", () => {
        dockStore.toolbarVisible = true;
        dockStore.managerVisible = true;

        dockStore.enterMockups();

        expect(dockStore.toolbarVisible).toBe(false);
        expect(dockStore.managerVisible).toBe(false);
      });

      it("resets keyboard modifier states", () => {
        dockStore.enterMockups();

        expect(keyboardStore.resetModifierStates).toHaveBeenCalled();
      });

      it("reports isManagerMode as true", () => {
        dockStore.enterMockups();

        expect(dockStore.isManagerMode).toBe(true);
      });
    });

    describe("enterGrids", () => {
      it("sets mode to grids", () => {
        dockStore.enterGrids();

        expect(dockStore.mode).toBe("grids");
      });

      it("hides toolbar and manager", () => {
        dockStore.toolbarVisible = true;
        dockStore.managerVisible = true;

        dockStore.enterGrids();

        expect(dockStore.toolbarVisible).toBe(false);
        expect(dockStore.managerVisible).toBe(false);
      });

      it("resets keyboard modifier states", () => {
        dockStore.enterGrids();

        expect(keyboardStore.resetModifierStates).toHaveBeenCalled();
      });

      it("reports isManagerMode as true", () => {
        dockStore.enterGrids();

        expect(dockStore.isManagerMode).toBe(true);
      });
    });
  });

  describe("position toggle", () => {
    beforeEach(async () => {
      await dockStore.init();
    });

    it("toggles from bottom to top", () => {
      expect(dockStore.position).toBe("bottom");

      dockStore.togglePosition();

      expect(dockStore.position).toBe("top");
    });

    it("toggles from top to bottom", async () => {
      getSettingsByGroup.mockResolvedValue({ position: "top" });
      vi.resetModules();

      const module = await import("./dockStore.svelte");
      const store = module.dockStore;
      await store.init();

      expect(store.position).toBe("top");

      store.togglePosition();

      expect(store.position).toBe("bottom");
    });

    it("persists position change", () => {
      dockStore.togglePosition();

      expect(updateSetting).toHaveBeenCalledWith("dock", "position", "top");
    });
  });

  describe("theme toggle", () => {
    beforeEach(async () => {
      await dockStore.init();
    });

    it("toggles from light to dark", () => {
      expect(dockStore.theme).toBe("light");

      dockStore.toggleTheme();

      expect(dockStore.theme).toBe("dark");
    });

    it("toggles from dark to light", async () => {
      getSettingsByGroup.mockResolvedValue({ theme: "dark" });
      vi.resetModules();

      const module = await import("./dockStore.svelte");
      const store = module.dockStore;
      await store.init();

      expect(store.theme).toBe("dark");

      store.toggleTheme();

      expect(store.theme).toBe("light");
    });

    it("persists theme change", () => {
      dockStore.toggleTheme();

      expect(updateSetting).toHaveBeenCalledWith("dock", "theme", "dark");
    });
  });

  describe("size getter", () => {
    beforeEach(async () => {
      await dockStore.init();
    });

    it("returns toolbar size for toolbar mode", () => {
      expect(dockStore.size).toEqual({ width: 388, height: 48 });
    });

    it("returns mockups size for mockups mode", () => {
      dockStore.enterMockups();

      expect(dockStore.size).toEqual({ width: 816, height: 640 });
    });

    it("returns grids size for grids mode", () => {
      dockStore.enterGrids();

      expect(dockStore.size).toEqual({ width: 640, height: 600 });
    });
  });

  describe("isManagerMode", () => {
    beforeEach(async () => {
      await dockStore.init();
    });

    it("is false for toolbar mode", () => {
      expect(dockStore.isManagerMode).toBe(false);
    });

    it("is true for mockups mode", () => {
      dockStore.enterMockups();
      expect(dockStore.isManagerMode).toBe(true);
    });

    it("is true for grids mode", () => {
      dockStore.enterGrids();
      expect(dockStore.isManagerMode).toBe(true);
    });
  });

  describe("visibility setters", () => {
    it("allows setting managerVisible", () => {
      dockStore.managerVisible = true;
      expect(dockStore.managerVisible).toBe(true);

      dockStore.managerVisible = false;
      expect(dockStore.managerVisible).toBe(false);
    });

    it("allows setting toolbarVisible", () => {
      dockStore.toolbarVisible = false;
      expect(dockStore.toolbarVisible).toBe(false);

      dockStore.toolbarVisible = true;
      expect(dockStore.toolbarVisible).toBe(true);
    });
  });
});
