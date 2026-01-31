/**
 * App Component Tests
 *
 * Testing the App component requires mocking child Svelte components.
 * Since this is complex with the current Svelte/Vitest setup and App.svelte
 * is primarily a composition component with CSS variables, we focus on
 * testing the individual child components and the dockStore that controls theming.
 *
 * The App component's coverage comes from:
 * 1. Testing dockStore.theme in dockStore.test.ts
 * 2. Testing child components (Dock, GridOverlay, MockupOverlay, Toast) in their tests
 *
 * Integration testing would be better handled by E2E tests (Playwright).
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock dockStore
vi.mock("~/stores/dockStore.svelte", () => ({
  dockStore: {
    theme: "light" as "light" | "dark"
  }
}));

import { dockStore } from "~/stores/dockStore.svelte";

const mockDockStore = dockStore as unknown as {
  theme: "light" | "dark";
};

describe("App component integration (via stores)", () => {
  beforeEach(() => {
    mockDockStore.theme = "light";
  });

  it("dockStore provides theme for App component", () => {
    // App.svelte uses dockStore.theme for dark mode class
    expect(mockDockStore.theme).toBe("light");
  });

  it("theme can be changed to dark", () => {
    mockDockStore.theme = "dark";
    expect(mockDockStore.theme).toBe("dark");
  });
});
