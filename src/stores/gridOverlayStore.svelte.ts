/**
 * Grid Overlay Store
 *
 * Manages grid overlay display settings.
 * Subscribes to settings events for automatic synchronization.
 */

// Constants
import { DEFAULT_GRID_OVERLAY_SETTINGS } from "~/constants";
// Database
import { getGrid, getSettingsByGroup } from "./database";
// Stores
import { settingsEventBus } from "./eventBus";
import { toastStore } from "./toastStore.svelte";

function createGridOverlayStore() {
  let showLayoutGrid = $state(DEFAULT_GRID_OVERLAY_SETTINGS.showLayoutGrid);
  let activeLayoutGridId = $state<string>("");
  let activeLayoutGridConfig = $state<LayoutGridConfig | undefined>(undefined);
  let layoutGridColor = $state(DEFAULT_GRID_OVERLAY_SETTINGS.layoutGridColor);

  let showSpacingGrid = $state(DEFAULT_GRID_OVERLAY_SETTINGS.showSpacingGrid);
  let spacingGridColor = $state(DEFAULT_GRID_OVERLAY_SETTINGS.spacingGridColor);
  let spacingGridHeight = $state(DEFAULT_GRID_OVERLAY_SETTINGS.spacingGridHeight);

  let initialized = $state(false);
  let initPromise: Promise<void> | null = null;

  async function loadActiveGrid(id: string) {
    if (!id) {
      activeLayoutGridConfig = undefined;
      return;
    }
    try {
      const grid = await getGrid(id);
      activeLayoutGridConfig = grid;
      if (!grid) {
        toastStore.showError(new Error("Grid not found."));
      }
    } catch (e) {
      activeLayoutGridConfig = undefined;
      toastStore.showError(e, "Failed to load grid");
    }
  }

  function applySettings(settings: Partial<GridOverlaySettings>) {
    if (settings.showLayoutGrid !== undefined) showLayoutGrid = settings.showLayoutGrid;
    if (settings.layoutGridColor !== undefined) layoutGridColor = settings.layoutGridColor;
    if (settings.showSpacingGrid !== undefined) showSpacingGrid = settings.showSpacingGrid;
    if (settings.spacingGridColor !== undefined) spacingGridColor = settings.spacingGridColor;
    if (settings.spacingGridHeight !== undefined) spacingGridHeight = settings.spacingGridHeight;
    if (settings.activeLayoutGridId !== undefined) {
      activeLayoutGridId = settings.activeLayoutGridId;
      loadActiveGrid(activeLayoutGridId);
    }
  }

  // Subscribe to settings events for automatic synchronization
  const unsubscribe = settingsEventBus.on("gridOverlay", applySettings);

  return {
    get activeLayoutGridId() {
      return activeLayoutGridId;
    },
    get activeLayoutGrid() {
      return activeLayoutGridConfig;
    },
    get showLayoutGrid() {
      return showLayoutGrid;
    },
    get layoutGridColor() {
      return layoutGridColor;
    },
    get showSpacingGrid() {
      return showSpacingGrid;
    },
    get spacingGridColor() {
      return spacingGridColor;
    },
    get spacingGridHeight() {
      return spacingGridHeight;
    },
    get initialized() {
      return initialized;
    },

    init: async () => {
      if (initialized || initPromise) return initPromise;

      initPromise = (async () => {
        try {
          const settings = await getSettingsByGroup("gridOverlay");

          if (settings.activeLayoutGridId !== undefined) activeLayoutGridId = settings.activeLayoutGridId;
          if (settings.showLayoutGrid !== undefined) showLayoutGrid = settings.showLayoutGrid;
          if (settings.layoutGridColor !== undefined) layoutGridColor = settings.layoutGridColor;
          if (settings.showSpacingGrid !== undefined) showSpacingGrid = settings.showSpacingGrid;
          if (settings.spacingGridColor !== undefined) spacingGridColor = settings.spacingGridColor;
          if (settings.spacingGridHeight !== undefined) spacingGridHeight = settings.spacingGridHeight;

          await loadActiveGrid(activeLayoutGridId);
        } catch (e) {
          toastStore.showError(e, "Failed to load grid overlay settings");
        } finally {
          initialized = true;
          initPromise = null;
        }
      })();

      return initPromise;
    },

    // Manual sync for bulk updates (e.g., reset)
    syncSettings: applySettings,

    cleanup: unsubscribe
  };
}

export const gridOverlayStore = createGridOverlayStore();
