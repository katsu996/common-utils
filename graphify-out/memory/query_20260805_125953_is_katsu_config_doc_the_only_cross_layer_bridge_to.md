---
type: "path_query"
date: "2026-08-05T12:59:53.826763+00:00"
question: "Is katsu-config Doc the only cross-layer bridge to config-files.js?"
contributor: "graphify"
outcome: "dead_end"
source_nodes: ["katsu-config Doc", "config-files.js"]
---

# Q: Is katsu-config Doc the only cross-layer bridge to config-files.js?

## Answer

Expanded via vocab: [katsu, config, doc, cli, config files]. HYPOTHESIS REFUTED. katsu-config Doc (docs_cli_katsu_config, c3, degree 16) has 16/16 references edges, all to OTHER DOCS inside c3 (readme, index, getting-started, config docs, migration guide). ZERO edges to any code. nx.shortest_path('katsu-config Doc', 'config-files.js') raises NetworkXNoPath - the two are DISCONNECTED. The whole graph has only 10 cross-community edge groups: the CLI spine (c0-c4-c5-c8 rich), manifest hub c2->c7/c9/c11/c8, and c3<->c6 docs. NO cross-layer bridge exists between docs (c3) and implementation (c0/c4/c5/c8), nor between exports (c11) and config files, nor into the Math library (c13). The doc layer fully describes the CLI but is structurally absent from it.

## Outcome

- Signal: dead_end

## Source Nodes

- katsu-config Doc
- config-files.js