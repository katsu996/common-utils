// common-utils-repo/src/math.ts

/**
 * 2つの数値を加算します。
 *
 * @param a - 加算する最初の数値
 * @param b - 加算する2番目の数値
 * @returns 2つの数値の和
 *
 * @remarks
 * エッジケースの処理：
 * - `Infinity`を含む計算は、JavaScriptの標準的な動作に従います（例：`Infinity + 5 = Infinity`）
 * - `NaN`を含む計算は常に`NaN`を返します
 * - 浮動小数点数の精度問題に注意してください（例：`0.1 + 0.2 !== 0.3`）
 *
 * @example
 * ```typescript
 * const sum = add(5, 3); // 8
 * const negativeSum = add(-2, -3); // -5
 * const decimalSum = add(1.5, 2.3); // 3.8
 * const infinitySum = add(Infinity, 5); // Infinity
 * const nanSum = add(NaN, 5); // NaN
 * ```
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * 2つの数値を減算します。
 *
 * @param a - 減算される数値（被減数）
 * @param b - 減算する数値（減数）
 * @returns 2つの数値の差（a - b）
 *
 * @remarks
 * エッジケースの処理：
 * - `Infinity`を含む計算は、JavaScriptの標準的な動作に従います（例：`Infinity - 5 = Infinity`、`5 - Infinity = -Infinity`）
 * - `NaN`を含む計算は常に`NaN`を返します
 * - 浮動小数点数の精度問題に注意してください（例：`0.3 - 0.1 !== 0.2`）
 *
 * @example
 * ```typescript
 * const diff = sub(10, 4); // 6
 * const negativeDiff = sub(-5, -3); // -2
 * const decimalDiff = sub(3.8, 1.5); // 2.3
 * const infinityDiff = sub(Infinity, 5); // Infinity
 * const nanDiff = sub(NaN, 5); // NaN
 * ```
 */
export function sub(a: number, b: number): number {
  return a - b;
}
