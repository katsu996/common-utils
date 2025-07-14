import { describe, it, expect } from 'vitest';
import { add, sub } from '../src/math';

describe('Math utilities', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should add negative numbers', () => {
      expect(add(-2, -3)).toBe(-5);
    });

    it('should add positive and negative numbers', () => {
      expect(add(5, -3)).toBe(2);
      expect(add(-5, 3)).toBe(-2);
    });

    it('should handle zero', () => {
      expect(add(0, 5)).toBe(5);
      expect(add(5, 0)).toBe(5);
      expect(add(0, 0)).toBe(0);
    });

    it('should handle decimal numbers', () => {
      expect(add(1.5, 2.3)).toBeCloseTo(3.8);
    });
  });

  describe('sub', () => {
    it('should subtract two positive numbers', () => {
      expect(sub(5, 3)).toBe(2);
    });

    it('should subtract negative numbers', () => {
      expect(sub(-5, -3)).toBe(-2);
    });

    it('should subtract positive and negative numbers', () => {
      expect(sub(5, -3)).toBe(8);
      expect(sub(-5, 3)).toBe(-8);
    });

    it('should handle zero', () => {
      expect(sub(5, 0)).toBe(5);
      expect(sub(0, 5)).toBe(-5);
      expect(sub(0, 0)).toBe(0);
    });

    it('should handle decimal numbers', () => {
      expect(sub(3.8, 1.5)).toBeCloseTo(2.3);
    });
  });
});