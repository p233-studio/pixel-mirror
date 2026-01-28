/**
 * Toast Store - Manages error notifications
 */

import { normalizeError } from "~/utils/errors";

let unhandledRejectionListenerAdded = false;

function createToastStore() {
  let currentMessage = $state<string | undefined>(undefined);

  const showError = (error: unknown, context?: string) => {
    const appError = normalizeError(error, context);
    currentMessage = appError.message;
    console.error("[PixelMirror]", appError.message, appError.details ?? "");
  };

  // Global error handler for unhandled Promise rejections
  if (typeof window !== "undefined" && !unhandledRejectionListenerAdded) {
    unhandledRejectionListenerAdded = true;
    window.addEventListener("unhandledrejection", (e) => {
      e.preventDefault();
      showError(e.reason);
    });
  }

  return {
    get errorMessage() {
      return currentMessage;
    },
    showError,
    clear: () => {
      currentMessage = undefined;
    }
  };
}

export const toastStore = createToastStore();
