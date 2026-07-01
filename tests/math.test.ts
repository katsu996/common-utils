import { describe, expect, it } from "vitest";
import { add, average, clamp, roundTo, sub, sum } from "../src/math";

describe("Math utilities", () => {
  describe("add", () => {
    it("should add two positive numbers", () => {
      expect(add(2, 3)).toBe(5);
    });

    it("should add negative numbers", () => {
      expect(add(-2, -3)).toBe(-5);
    });

    it("should add positive and negative numbers", () => {
      expect(add(5, -3)).toBe(2);
      expect(add(-5, 3)).toBe(-2);
    });

    it("should handle zero", () => {
      expect(add(0, 5)).toBe(5);
      expect(add(5, 0)).toBe(5);
      expect(add(0, 0)).toBe(0);
    });

    it("should handle decimal numbers", () => {
      expect(add(1.5, 2.3)).toBeCloseTo(3.8);
    });

    it("should handle Infinity values", () => {
      expect(add(Number.POSITIVE_INFINITY, 5)).toBe(Number.POSITIVE_INFINITY);
      expect(add(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)).toBe(Number.POSITIVE_INFINITY);
      expect(add(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)).toBeNaN();
    });

    it("should handle NaN values", () => {
      expect(add(Number.NaN, 5)).toBeNaN();
      expect(add(5, Number.NaN)).toBeNaN();
    });

    it("should handle very large numbers", () => {
      expect(add(Number.MAX_SAFE_INTEGER, 1)).toBe(9007199254740992);
    });

    it("should handle floating point precision issues", () => {
      expect(add(0.1, 0.2)).toBeCloseTo(0.3, 15);
    });
  });

  describe("sub", () => {
    it("should subtract two positive numbers", () => {
      expect(sub(5, 3)).toBe(2);
    });

    it("should subtract negative numbers", () => {
      expect(sub(-5, -3)).toBe(-2);
    });

    it("should subtract positive and negative numbers", () => {
      expect(sub(5, -3)).toBe(8);
      expect(sub(-5, 3)).toBe(-8);
    });

    it("should handle zero", () => {
      expect(sub(5, 0)).toBe(5);
      expect(sub(0, 5)).toBe(-5);
      expect(sub(0, 0)).toBe(0);
    });

    it("should handle decimal numbers", () => {
      expect(sub(3.8, 1.5)).toBeCloseTo(2.3);
    });

    it("should handle very large numbers", () => {
      expect(sub(Number.MAX_SAFE_INTEGER, 1)).toBe(9007199254740990);
      expect(sub(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)).toBe(0);
    });

    it("should handle floating point precision issues", () => {
      expect(sub(0.3, 0.1)).toBeCloseTo(0.2, 15);
    });
  });

  describe("sum", () => {
    it("should sum an array of positive numbers", () => {
      expect(sum([1, 2, 3, 4, 5])).toBe(15);
    });

    it("should handle negative numbers", () => {
      expect(sum([-1, -2, -3])).toBe(-6);
    });

    it("should handle mixed positive and negative numbers", () => {
      expect(sum([1, -2, 3, -4])).toBe(-2);
    });

    it("should handle an empty array", () => {
      expect(sum([])).toBe(0);
    });

    it("should handle a single element array", () => {
      expect(sum([42])).toBe(42);
    });

    it("should handle decimal numbers", () => {
      expect(sum([0.1, 0.2, 0.3])).toBeCloseTo(0.6);
    });
  });

  describe("average", () => {
    it("should calculate average of positive numbers", () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3);
    });

    it("should handle an empty array", () => {
      expect(average([])).toBe(0);
    });

    it("should handle a single element array", () => {
      expect(average([42])).toBe(42);
    });

    it("should handle decimal results", () => {
      expect(average([1, 2])).toBeCloseTo(1.5);
    });

    it("should handle negative values", () => {
      expect(average([-5, 5])).toBe(0);
    });
  });

  describe("clamp", () => {
    it("should return the value when within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it("should return min when value is below range", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it("should return max when value is above range", () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it("should handle min equals max", () => {
      expect(clamp(5, 3, 3)).toBe(3);
    });

    it("should handle negative ranges", () => {
      expect(clamp(-10, -5, 0)).toBe(-5);
      expect(clamp(-3, -5, 0)).toBe(-3);
      expect(clamp(5, -5, 0)).toBe(0);
    });

    it("should handle decimal values", () => {
      expect(clamp(3.5, 1.0, 5.0)).toBe(3.5);
      expect(clamp(0.5, 1.0, 5.0)).toBe(1.0);
      expect(clamp(10.5, 1.0, 5.0)).toBe(5.0);
    });
  });

  describe("roundTo", () => {
    it("should round to the specified number of decimal places", () => {
      expect(roundTo(Math.PI, 2)).toBe(3.14);
      expect(roundTo(Math.PI, 3)).toBe(Math.PI);
      expect(roundTo(Math.PI, 0)).toBe(3);
    });

    it("should handle rounding up", () => {
      expect(roundTo(2.5, 0)).toBe(3);
      expect(roundTo(2.555, 2)).toBe(2.56);
    });

    it("should handle integer values", () => {
      expect(roundTo(42, 0)).toBe(42);
      expect(roundTo(42, 2)).toBe(42);
    });

    it("should handle negative numbers", () => {
      expect(roundTo(-Math.PI, 2)).toBe(-3.14);
      expect(roundTo(-2.5, 0)).toBe(-2);
    });

    it("should handle zero", () => {
      expect(roundTo(0, 2)).toBe(0);
    });
  });
});
