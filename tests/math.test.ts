import { describe, expect, it } from "vitest";
import { add, sub } from "../src/math";

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
      expect(add(5, Number.POSITIVE_INFINITY)).toBe(Number.POSITIVE_INFINITY);
      expect(add(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)).toBe(Number.POSITIVE_INFINITY);
      expect(add(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)).toBeNaN();
    });

    it("should handle NaN values", () => {
      expect(add(Number.NaN, 5)).toBeNaN();
      expect(add(5, Number.NaN)).toBeNaN();
      expect(add(Number.NaN, Number.NaN)).toBeNaN();
    });

    it("should handle very large numbers", () => {
      expect(add(Number.MAX_SAFE_INTEGER, 1)).toBe(9007199254740992);
      expect(add(Number.MAX_SAFE_INTEGER, 0)).toBe(Number.MAX_SAFE_INTEGER);
      expect(add(Number.MAX_SAFE_INTEGER, -1)).toBe(9007199254740990);
    });

    it("should handle very small numbers", () => {
      expect(add(Number.MIN_SAFE_INTEGER, 1)).toBe(-9007199254740990);
      expect(add(Number.MIN_SAFE_INTEGER, 0)).toBe(Number.MIN_SAFE_INTEGER);
      expect(add(Number.MIN_SAFE_INTEGER, -1)).toBe(-9007199254740992);
    });

    it("should handle floating point precision issues", () => {
      // 浮動小数点数の精度問題の例
      expect(add(0.1, 0.2)).not.toBe(0.3);
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

    it("should handle Infinity values", () => {
      expect(sub(Number.POSITIVE_INFINITY, 5)).toBe(Number.POSITIVE_INFINITY);
      expect(sub(5, Number.POSITIVE_INFINITY)).toBe(Number.NEGATIVE_INFINITY);
      expect(sub(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)).toBeNaN();
      expect(sub(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY)).toBeNaN();
    });

    it("should handle NaN values", () => {
      expect(sub(Number.NaN, 5)).toBeNaN();
      expect(sub(5, Number.NaN)).toBeNaN();
      expect(sub(Number.NaN, Number.NaN)).toBeNaN();
    });

    it("should handle very large numbers", () => {
      expect(sub(Number.MAX_SAFE_INTEGER, 1)).toBe(9007199254740990);
      expect(sub(Number.MAX_SAFE_INTEGER, 0)).toBe(Number.MAX_SAFE_INTEGER);
      expect(sub(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)).toBe(0);
    });

    it("should handle very small numbers", () => {
      expect(sub(Number.MIN_SAFE_INTEGER, 1)).toBe(-9007199254740992);
      expect(sub(Number.MIN_SAFE_INTEGER, 0)).toBe(Number.MIN_SAFE_INTEGER);
      expect(sub(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER)).toBe(0);
    });

    it("should handle floating point precision issues", () => {
      // 浮動小数点数の精度問題の例
      expect(sub(0.3, 0.1)).not.toBe(0.2);
      expect(sub(0.3, 0.1)).toBeCloseTo(0.2, 15);
    });
  });
});
