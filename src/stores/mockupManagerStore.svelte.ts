/**
 * Mockup Manager Store
 *
 * Handles mockup CRUD operations and file upload with validation.
 */

// Utils
import { generateMockupBuffers } from "~/utils/generate-mockup-buffers";
// Database
import { addMockups, deleteMockup, getAllMockups, resetMockups } from "./database";
// Stores
import { mockupOverlayStore } from "./mockupOverlayStore.svelte";
import { toastStore } from "./toastStore.svelte";

function createMockupManagerStore() {
  let mockups = $state<Omit<Mockup, "originalBuffer">[]>([]);

  let initialized = $state(false);
  let initPromise: Promise<void> | null = null;

  return {
    get initialized() {
      return initialized;
    },
    get mockups() {
      return mockups;
    },
    get activeMockupId() {
      return mockupOverlayStore.activeMockupId;
    },

    init: async () => {
      if (initialized || initPromise) return initPromise;

      initPromise = (async () => {
        try {
          mockups = await getAllMockups();
        } catch (e) {
          toastStore.showError(e, "Failed to load mockups");
        } finally {
          initialized = true;
          initPromise = null;
        }
      })();

      return initPromise;
    },

    upload: async (files: File[]) => {
      if (files.length === 0) return;

      try {
        const { data, errors } = await generateMockupBuffers(files);

        // Show validation/processing errors
        if (errors.length > 0) {
          errors.forEach((error) => toastStore.showError(error));
        }

        // Save valid mockups
        if (data.length > 0) {
          await addMockups(data);
          mockups = await getAllMockups();
        }
      } catch (e) {
        toastStore.showError(e, "Failed to upload mockups");
      }
    },

    select: (id: string) => {
      mockupOverlayStore.setActiveMockup(id);
    },

    // CRUD operations use try/catch to ensure data consistency:
    // local state is only updated after database operation succeeds

    delete: async (id: string) => {
      try {
        await deleteMockup(id);
        mockups = mockups.filter((m) => m.id !== id);

        if (mockupOverlayStore.activeMockupId === id) {
          mockupOverlayStore.setActiveMockup(null);
        }
      } catch (e) {
        toastStore.showError(e, "Failed to delete mockup");
      }
    },

    clear: async () => {
      try {
        await resetMockups();
        mockups = [];
        mockupOverlayStore.setActiveMockup(null);
      } catch (e) {
        toastStore.showError(e, "Failed to clear mockups");
      }
    }
  };
}

export const mockupManagerStore = createMockupManagerStore();
