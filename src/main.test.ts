/**
 * Main Entry Point Tests
 *
 * Tests for the main.ts entry point behavior.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock App.svelte since it's a custom element
vi.mock("./App.svelte", () => ({}));

describe("main.ts", () => {
  beforeEach(() => {
    vi.resetModules();

    // Reset DOM state
    document.body.innerHTML = "";
    document.documentElement.style.position = "";
  });

  it("creates pixel-mirror element if not present", async () => {
    expect(document.querySelector("pixel-mirror")).toBeNull();

    await import("./main");

    expect(document.querySelector("pixel-mirror")).toBeInTheDocument();
  });

  it("does not create duplicate element if already present", async () => {
    // Pre-create the element
    const existingElement = document.createElement("pixel-mirror");
    document.body.appendChild(existingElement);

    await import("./main");

    const elements = document.querySelectorAll("pixel-mirror");
    expect(elements.length).toBe(1);
  });

  it("sets html element position to relative", async () => {
    expect(document.documentElement.style.position).toBe("");

    await import("./main");

    expect(document.documentElement.style.position).toBe("relative");
  });
});
