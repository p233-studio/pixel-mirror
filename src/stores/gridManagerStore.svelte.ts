/**
 * Grid Manager Store
 *
 * Handles layout grid CRUD operations with validation.
 * Settings are automatically synced via eventBus.
 */

// Constants
import { DEFAULT_GRID_TEMPLATE, DEFAULT_GRID_OVERLAY_SETTINGS } from "~/constants";
// Database
import {
  addGrid,
  deleteGrid,
  getAllGrids,
  getSettingsByGroup,
  resetGridOverlaySettings,
  resetGrids,
  updateSetting
} from "./database";
// Stores
import { gridOverlayStore } from "./gridOverlayStore.svelte";
import { toastStore } from "./toastStore.svelte";
// Utils
import { validateLayoutGridConfig } from "~/utils/validation";

function createGridManagerStore() {
  let layoutGrids = $state<LayoutGridConfig[]>([]);

  let initialized = $state(false);
  let initPromise: Promise<void> | null = null;

  const setActiveLayoutGrid = async (id: string) => {
    try {
      await updateSetting("gridOverlay", "activeLayoutGridId", id);
      // Note: gridOverlayStore is automatically synced via eventBus
    } catch (e) {
      toastStore.showError(e, "Failed to set active grid");
      throw e;
    }
  };

  return {
    get initialized() {
      return initialized;
    },
    get layoutGrids() {
      return layoutGrids;
    },

    init: async () => {
      if (initialized || initPromise) return initPromise;

      initPromise = (async () => {
        try {
          const loadedGrids = await getAllGrids();
          if (loadedGrids.length === 0) {
            const id = await addGrid(DEFAULT_GRID_TEMPLATE);
            layoutGrids = [{ ...DEFAULT_GRID_TEMPLATE, id, createdAt: Date.now() }];
            await setActiveLayoutGrid(id);
          } else {
            layoutGrids = loadedGrids;
            const settings = await getSettingsByGroup("gridOverlay");
            if (settings.activeLayoutGridId) {
              const activeExists = loadedGrids.some((g) => g.id === settings.activeLayoutGridId);
              if (!activeExists) {
                await setActiveLayoutGrid(loadedGrids[0].id);
              }
            } else {
              await setActiveLayoutGrid(loadedGrids[0].id);
            }
          }
        } catch (e) {
          toastStore.showError(e, "Failed to load grids");
        } finally {
          initialized = true;
          initPromise = null;
        }
      })();

      return initPromise;
    },

    // Settings use fire-and-forget pattern: state syncs via eventBus,
    // persistence failure only shows error (recoverable on next session)

    toggleSpacingGrid: () => {
      const newValue = !gridOverlayStore.showSpacingGrid;
      updateSetting("gridOverlay", "showSpacingGrid", newValue).catch(toastStore.showError);
    },

    updateSpacingGridHeight: (height: string) => {
      updateSetting("gridOverlay", "spacingGridHeight", height).catch(toastStore.showError);
    },

    updateSpacingGridColor: (color: string) => {
      updateSetting("gridOverlay", "spacingGridColor", color).catch(toastStore.showError);
    },

    toggleLayoutGrid: () => {
      const newValue = !gridOverlayStore.showLayoutGrid;
      updateSetting("gridOverlay", "showLayoutGrid", newValue).catch(toastStore.showError);
    },

    updateLayoutGridColor: (color: string) => {
      updateSetting("gridOverlay", "layoutGridColor", color).catch(toastStore.showError);
    },

    setActiveLayoutGrid,

    // CRUD operations use try/catch to ensure data consistency:
    // local state is only updated after database operation succeeds

    add: async (grid: Omit<LayoutGridConfig, "id" | "createdAt">) => {
      // Validate grid configuration
      const validation = validateLayoutGridConfig(grid);
      if (!validation.success) {
        toastStore.showError(validation.error);
        return undefined;
      }

      try {
        const id = await addGrid(validation.data);
        layoutGrids = await getAllGrids();
        await setActiveLayoutGrid(id);
        return id;
      } catch (e) {
        toastStore.showError(e, "Failed to add grid");
        return undefined;
      }
    },

    delete: async (id: string) => {
      try {
        await deleteGrid(id);
        layoutGrids = layoutGrids.filter((g) => g.id !== id);

        if (gridOverlayStore.activeLayoutGridId === id) {
          const nextGrid = layoutGrids[0];
          if (nextGrid) {
            await setActiveLayoutGrid(nextGrid.id);
          } else {
            const newId = await addGrid(DEFAULT_GRID_TEMPLATE);
            layoutGrids = await getAllGrids();
            await setActiveLayoutGrid(newId);
          }
        }
      } catch (e) {
        toastStore.showError(e, "Failed to delete grid");
      }
    },

    reset: async () => {
      try {
        await resetGrids();
        await resetGridOverlaySettings();
        const id = await addGrid(DEFAULT_GRID_TEMPLATE);
        layoutGrids = [{ ...DEFAULT_GRID_TEMPLATE, id, createdAt: Date.now() }];
        await setActiveLayoutGrid(id);
        // Sync defaults that aren't covered by setActiveLayoutGrid
        gridOverlayStore.syncSettings(DEFAULT_GRID_OVERLAY_SETTINGS);
      } catch (e) {
        toastStore.showError(e, "Failed to reset grids");
      }
    }
  };
}

export const gridManagerStore = createGridManagerStore();
