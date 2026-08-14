---
type: "explain"
date: "2026-08-05T12:22:53.600253+00:00"
question: "tsconfig.base.json connections and edge-gap impact"
contributor: "graphify"
outcome: "useful"
source_nodes: ["compilerOptions", "tsconfig.base.json", "tsconfig.json", "TypeScript Configuration Doc"]
---

# Q: tsconfig.base.json connections and edge-gap impact

## Answer

Expanded via vocab: [tsconfig, compiler, options, config]. The god node compilerOptions (tsconfig_base_compileroptions, c1, degree 41) is a FALSE-POSITIVE hub: all 41 edges are contains to its own JSON keys inside tsconfig.base.json (L2-42). tsconfig.base.json is fragmented into 3 disconnected nodes: tsconfig_base (c1, src=tsconfig.base.json, degree 1), package_json_ref_tsconfig_base_json (c2, ref in package.json files L13), and ./tsconfig.base.json (c10, extended by tsconfig.json). No edges connect exports ./tsconfig OR tsconfig.json overlap OR the docs. Named-conflict: 3 IDs for one real file explains the 41 dangling edges in the health check. Config inheritance chain (c10: tsconfig.json --extends--> ./tsconfig.base.json) and doc chain (c3: TypeScript Config Doc --references--> katsu-config Doc, @katsu996/common-utils/tsconfig) are intact but mutually unlinked.

## Outcome

- Signal: useful

## Source Nodes

- compilerOptions
- tsconfig.base.json
- tsconfig.json
- TypeScript Configuration Doc