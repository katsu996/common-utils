---
type: "query"
date: "2026-08-05T12:17:11.285297+00:00"
question: "Why does scripts connect npm Scripts to CLI Dependencies?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["scripts", "cli", "dependencies", "katsu-config"]
---

# Q: Why does scripts connect npm Scripts to CLI Dependencies?

## Answer

Expanded from original query via vocab: [scripts, cli, dependencies, npm, command, package, install, init]. The bridge is package.json itself (package.json:L1). The scripts node (package_scripts, c7, package.json:L45) is connected to package.json (c2) via a contains edge, and the same manifest also contains the dependencies block (L67: @clack/prompts, commander, ora, picocolors) and the bin entry katsu-config (L10-11). The cli script (package_scripts_cli, c7, L63) is the executable link: it runs the CLI whose runtime dependencies are the CLI Dependencies community. INFERRED: cli script runs katsu-config which imports commander/@clack/prompts/ora — no direct graph edge.

## Outcome

- Signal: useful

## Source Nodes

- scripts
- cli
- dependencies
- katsu-config