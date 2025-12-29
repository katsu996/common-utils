// common-utils-repo/src/index.ts
export * from "./math";

/**
 * 共通のデータ型定義。
 *
 * @example
 * ```typescript
 * const data: CommonData = {
 *   id: "123",
 *   name: "example"
 * };
 * ```
 */
export type CommonData = {
  /** 一意の識別子 */
  id: string;
  /** 名前 */
  name: string;
};
