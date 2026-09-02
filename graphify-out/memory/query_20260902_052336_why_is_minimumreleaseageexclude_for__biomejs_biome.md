---
type: "query"
date: "2026-09-02T05:23:36.580028+00:00"
question: "Why is minimumReleaseAgeExclude for @biomejs/biome in TypeScript Strict Config instead of CI/CD?"
contributor: "graphify"
outcome: "useful"
source_nodes:
  [
    "minimumReleaseAgeExclude for @biomejs/biome packages",
    "Biome Platform-Specific CLI Packages (darwin-arm64/x64, linux-musl/arm64/x64, win32-arm64/x64)",
    "Mise Manual Copy (mise.toml requires hand copy, imperfect distribution)",
  ]
---

# Q: Why is minimumReleaseAgeExclude for @biomejs/biome in TypeScript Strict Config instead of CI/CD?

## Answer

Useful externality: pnpm-workspace.yaml pins @biomejs/biome@2.5.10+8 platform CLIs via minimumReleaseAgeExclude to bypass pnpm minimumReleaseAge delay. In TypeScript Strict Config community as island (should be CI/CD). Has rationale_for[EXTRACTED] to Biome Platform CLIs, shares_data_with[AMBIGUOUS] to NPM_TOKEN (both release fallbacks), 3-hop to Mise Manual Copy via Project Structure->Export Paths Table. Not in any hyperedge - overlooked externality like Mise but unlike Mise not yet normalized. Pair with Mise as twin externalities.

## Outcome

- Signal: useful

## Source Nodes

- minimumReleaseAgeExclude for @biomejs/biome packages
- Biome Platform-Specific CLI Packages (darwin-arm64/x64, linux-musl/arm64/x64, win32-arm64/x64)
- Mise Manual Copy (mise.toml requires hand copy, imperfect distribution)
