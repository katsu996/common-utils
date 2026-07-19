# 数学ユーティリティ

`@katsu996/common-utils/math` からインポート可能な数学関数を提供します。

## 関数一覧

### add

2 つの数値を加算します。

```typescript
function add(a: number, b: number): number;
```

**例:**

```typescript
import { add } from "@katsu996/common-utils";

add(1, 2); // 3
add(-5, 3); // -2
add(0.1, 0.2); // 0.30000000000000004
```

### sub

2 つの数値を減算します。

```typescript
function sub(a: number, b: number): number;
```

**例:**

```typescript
import { sub } from "@katsu996/common-utils";

sub(5, 3); // 2
sub(1, 5); // -4
sub(0.3, 0.1); // 0.19999999999999998
```

### sum

数値配列の合計を計算します。

```typescript
function sum(values: number[]): number;
```

**例:**

```typescript
import { sum } from "@katsu996/common-utils";

sum([1, 2, 3]); // 6
sum([]); // 0
sum([-1, 0, 1]); // 0
```

### average

数値配列の平均を計算します。空配列の場合は `0` を返します。

```typescript
function average(values: number[]): number;
```

**例:**

```typescript
import { average } from "@katsu996/common-utils";

average([1, 2, 3]); // 2
average([]); // 0
average([5]); // 5
```

### clamp

値を指定した範囲内に制限します。

```typescript
function clamp(value: number, min: number, max: number): number;
```

**例:**

```typescript
import { clamp } from "@katsu996/common-utils";

clamp(10, 0, 5); // 5
clamp(-10, 0, 5); // 0
clamp(3, 0, 5); // 3
```

### roundTo

数値を指定した小数点以下の桁数に丸めます。

```typescript
function roundTo(value: number, decimals: number): number;
```

**例:**

```typescript
import { roundTo } from "@katsu996/common-utils";

roundTo(3.14159, 2); // 3.14
roundTo(3.14159, 0); // 3
roundTo(1.005, 2); // 1.01（銀行丸め）
```
