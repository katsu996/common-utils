---
type: "query"
date: "2026-08-05T12:20:29.836603+00:00"
question: "Why does exports connect Package Exports to CLI Dependencies?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["exports", "package.json", "./math", "config.js"]
---

# Q: Why does exports connect Package Exports to CLI Dependencies?

## Answer

Expanded via vocab: [exports, package, cli, dependencies, config, tsconfig, math]. exports (package_exports, c11, package.json:L26) links to c2 via one contains edge to package.json (L1, c2). It declares 8 public subpaths (./math L32, ./package.json L37, ./biome L38, ./mise L39, ./oxlint L40, ./tsconfig L41, ./vite L42, ./vitest L43). Only ./math is decomposed into types/import/require (L33-35). All other subpaths have a single back-edge to exports only - no links to the config template nodes they expose. Bridge is structural (manifest hub effect), not behavioral. Also package.json --imports_from--> config.js (bin/config.js L14) ties CLI to the manifest.

## Outcome

- Signal: useful

## Source Nodes

- exports
- package.json
- ./math
- config.js
