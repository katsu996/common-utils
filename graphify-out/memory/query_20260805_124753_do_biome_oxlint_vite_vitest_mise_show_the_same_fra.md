---
type: "explain"
date: "2026-08-05T12:47:53.117373+00:00"
question: "Do biome/oxlint/vite/vitest/mise show the same fragmentation pattern as tsconfig?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["vite.config.ts", "vite.config.base.ts", "oxlint.json", "oxlint.base.json", "./biome"]
---

# Q: Do biome/oxlint/vite/vitest/mise show the same fragmentation pattern as tsconfig?

## Answer

Expanded via vocab: [biome, oxlint, vite, vitest, mise, config]. Confirmed systematic. 1) Exports subpaths are islands: ./biome, ./mise, ./oxlint, ./vite, ./vitest, ./tsconfig each degree=1 with single back-edge to exports (c11), zero connection to their real config files. 2) oxlint.json (c14, degree 2: rules, ) and oxlint.base.json (c15, degree 1: ) are mutual strangers - no extends edge, no base-to-consumer link. 3) vite.config.ts<->vite.config.base.ts and vitest.config.ts<->vitest.config.base.ts are degree-1 pairs connected only to each other - 2-node islands (c16, c17) with no link to exports, CLI generator, or docs. Pattern: NOT all configs fragment into multi-ID splits like tsconfig; most are isolated singletons with the base/consumer link missing. Fix: rerun graphify extract --force for AST ID consistency.

## Outcome

- Signal: useful

## Source Nodes

- vite.config.ts
- vite.config.base.ts
- oxlint.json
- oxlint.base.json
- ./biome