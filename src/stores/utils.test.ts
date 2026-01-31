import { describe, expect, it } from "vitest";
import { clamp, roundTo } from "./utils";

describe("store utilities", () => {
  describe("clamp", () => {
    it("returns value when within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(0.5, 0, 1)).toBe(0.5);
    });

    it("clamps to minimum when value is below", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(-0.1, 0, 1)).toBe(0);
    });

    it("clamps to maximum when value is above", () => {
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(1.5, 0, 1)).toBe(1);
    });

    it("handles boundary values correctly", () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it("handles negative ranges", () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
      expect(clamp(0, -10, -1)).toBe(-1);
      expect(clamp(-15, -10, -1)).toBe(-10);
    });

    it("handles single value range (min === max)", () => {
      expect(clamp(5, 3, 3)).toBe(3);
      expect(clamp(1, 3, 3)).toBe(3);
    });

    it("handles floating point precision", () => {
      expect(clamp(0.1 + 0.2, 0, 1)).toBeCloseTo(0.3);
    });
  });

  describe("roundTo", () => {
    it("rounds to specified decimal places", () => {
      expect(roundTo(3.14159, 2)).toBe(3.14);
      expect(roundTo(3.14159, 3)).toBe(3.142);
      expect(roundTo(3.14159, 4)).toBe(3.1416);
    });

    it("rounds to 0 decimal places (integer)", () => {
      expect(roundTo(3.7, 0)).toBe(4);
      expect(roundTo(3.4, 0)).toBe(3);
      expect(roundTo(3.5, 0)).toBe(4); // rounds up at .5
    });

    it("handles already rounded values", () => {
      expect(roundTo(5, 2)).toBe(5);
      expect(roundTo(5.0, 2)).toBe(5);
    });

    it("handles negative numbers", () => {
      expect(roundTo(-3.14159, 2)).toBe(-3.14);
      expect(roundTo(-3.7, 0)).toBe(-4);
    });

    it("handles zero", () => {
      expect(roundTo(0, 2)).toBe(0);
      expect(roundTo(0.001, 2)).toBe(0);
    });

    it("handles large decimal places", () => {
      expect(roundTo(1.123456789, 8)).toBe(1.12345679);
    });

    it("handles values that need rounding up", () => {
      expect(roundTo(0.555, 2)).toBe(0.56);
      expect(roundTo(0.545, 2)).toBe(0.55);
    });
  });
});
