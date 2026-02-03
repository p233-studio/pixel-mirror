/**
 * Dock Store
 *
 * Manages the dock UI state machine with three modes:
 * - toolbar:  Main toolbar with quick actions
 * - mockups:  Mockup manager panel
 * - grids:    Grid manager panel
 *
 * When entering manager modes (mockups/grids), keyboard events for mockup
 * overlay are automatically disabled via the keyboardStore integration.
 */

// Database
import { getSettingsByGroup, updateSetting } from "./database";
// Stores
import { keyboardStore } from "./keyboardStore.svelte";
import { toastStore } from "./toastStore.svelte";

export const DOCK_TRANSITION_DURATION = 250;

const DOCK_SIZES: Record<DockMode, Size> = {
  toolbar: { width: 380, height: 44 },
  mockups: { width: 820, height: 480 },
  grids: { width: 640, height: 580 }
};

function createDockStore() {
  let mode = $state<DockMode>("toolbar");
  let position = $state<DockPosition>("bottom");
  let theme = $state<Theme>("light");
  let managerVisible = $state(false);
  let toolbarVisible = $state(true);

  let initialized = $state(false);
  let initPromise: Promise<void> | null = null;

  return {
    get initialized() {
      return initialized;
    },
    get mode() {
      return mode;
    },
    get position() {
      return position;
    },
    get theme() {
      return theme;
    },
    get managerVisible() {
      return managerVisible;
    },
    set managerVisible(v) {
      managerVisible = v;
    },
    get toolbarVisible() {
      return toolbarVisible;
    },
    set toolbarVisible(v) {
      toolbarVisible = v;
    },
    get size() {
      return DOCK_SIZES[mode];
    },
    get isManagerMode() {
      return mode === "mockups" || mode === "grids";
    },

    init: async () => {
      if (initialized || initPromise) return initPromise;

      initPromise = (async () => {
        try {
          const settings = await getSettingsByGroup("dock");
          if (settings.position) position = settings.position;
          if (settings.theme) theme = settings.theme;
        } catch (e) {
          toastStore.showError(e, "Failed to load dock settings");
        } finally {
          initialized = true;
          initPromise = null;
        }
      })();

      return initPromise;
    },

    enterToolbar: () => {
      managerVisible = false;
      mode = "toolbar";
      toolbarVisible = true;
      keyboardStore.resetModifierStates();
    },

    enterMockups: () => {
      keyboardStore.resetModifierStates();
      toolbarVisible = false;
      mode = "mockups";
      managerVisible = false;
    },

    enterGrids: () => {
      keyboardStore.resetModifierStates();
      toolbarVisible = false;
      mode = "grids";
      managerVisible = false;
    },

    togglePosition: () => {
      const newPosition = position === "bottom" ? "top" : "bottom";
      updateSetting("dock", "position", newPosition).catch(toastStore.showError);
      position = newPosition;
    },

    toggleTheme: () => {
      const newTheme = theme === "light" ? "dark" : "light";
      updateSetting("dock", "theme", newTheme).catch(toastStore.showError);
      theme = newTheme;
    }
  };
}

export const dockStore = createDockStore();
