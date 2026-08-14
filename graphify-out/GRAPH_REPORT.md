# Graph Report - .  (2026-08-05)

## Corpus Check
- Corpus is ~12,698 words - fits in a single context window. You may not need a graph.

## Summary
- 365 nodes · 764 edges · 16 communities
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 88 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Documentation Hub
- TypeScript Compiler Options
- Package Manager Utils
- CI/CD and Release Docs
- Manifest and Dependencies
- CLI Documentation and Analysis
- CLI Error Handling
- Dev Dependencies and AI Docs
- Update Command Flow
- Init Command Flow
- Project Services
- Config Data and Display
- Config File Registry
- Oxlint Config
- Interactive Prompts
- Spinner and Theme UI

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 43 edges
2. `scripts` - 22 edges
3. `DEVELOPMENT.md - Developer Documentation` - 20 edges
4. `katsu-config CLI Documentation` - 20 edges
5. `Documentation Index` - 17 edges
6. `Package Exports structural-islands finding` - 17 edges
7. `initCommand()` - 16 edges
8. `updateCommand()` - 16 edges
9. `README.md - User Documentation` - 16 edges
10. `Config fragmentation-pattern finding` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Validate Workflows` --references--> `dist`  [INFERRED]
  .github/workflows/validate.yml → package.json
- `katsu-config CLI Documentation` --references--> `oxfmt`  [INFERRED]
  docs/cli/katsu-config.md → package.json
- `No-cross-layer-bridge finding` --references--> `exports`  [INFERRED]
  graphify-out/memory/query_20260805_125953_is_katsu_config_doc_the_only_cross_layer_bridge_to.md → package.json
- `CLAUDE.md - AI Developer Instructions` --references--> `type-check`  [INFERRED]
  CLAUDE.md → package.json
- `katsu-config CLI Documentation` --references--> `type-check`  [INFERRED]
  docs/cli/katsu-config.md → package.json

## Import Cycles
- 1-file cycle: `bin/cli/commands/init.js -> bin/cli/commands/init.js`
- 1-file cycle: `bin/cli/config-files.js -> bin/cli/config-files.js`
- 1-file cycle: `bin/cli/services/project.js -> bin/cli/services/project.js`
- 1-file cycle: `bin/config.js -> bin/config.js`
- 1-file cycle: `tests/config.test.js -> tests/config.test.js`
- 1-file cycle: `bin/cli/ui/spinner.js -> bin/cli/ui/spinner.js`
- 1-file cycle: `vite.config.base.ts -> vite.config.base.ts`
- 1-file cycle: `vitest.config.base.ts -> vitest.config.base.ts`
- 2-file cycle: `bin/cli/commands/init.js -> bin/cli/ui/prompts.js -> bin/cli/commands/init.js`
- 2-file cycle: `bin/cli/commands/init.js -> bin/cli/config-files.js -> bin/cli/commands/init.js`
- 2-file cycle: `bin/cli/commands/init.js -> bin/cli/ui/display.js -> bin/cli/commands/init.js`
- 2-file cycle: `bin/cli/commands/init.js -> bin/cli/package.js -> bin/cli/commands/init.js`
- 2-file cycle: `bin/cli/commands/init.js -> bin/cli/services/project.js -> bin/cli/commands/init.js`
- 2-file cycle: `bin/cli/commands/init.js -> bin/cli/utils/errors.js -> bin/cli/commands/init.js`
- 3-file cycle: `bin/cli/commands/init.js -> bin/cli/ui/prompts.js -> bin/cli/config-files-data.js -> bin/cli/commands/init.js`
- 3-file cycle: `bin/cli/commands/init.js -> bin/cli/ui/prompts.js -> bin/cli/config-files.js -> bin/cli/commands/init.js`
- 3-file cycle: `bin/cli/commands/init.js -> bin/cli/ui/theme.js -> bin/cli/config-files.js -> bin/cli/commands/init.js`
- 3-file cycle: `bin/cli/commands/init.js -> bin/cli/config-files.js -> bin/cli/config-files-data.js -> bin/cli/commands/init.js`
- 3-file cycle: `bin/cli/commands/init.js -> bin/cli/ui/display.js -> bin/cli/config-files-data.js -> bin/cli/commands/init.js`
- 3-file cycle: `bin/cli/commands/init.js -> bin/cli/package.js -> bin/cli/config-files.js -> bin/cli/commands/init.js`

## Hyperedges (group relationships)
- **Release Pipeline (CI -> Tag -> Publish -> GitHub Release)** — _github_workflows_publish, _github_workflows_ci, release, docs_development_release [EXTRACTED 1.00]
- **Shared Config Template Inheritance System** — docs_development_config_inheritance, tsconfig_base, ref_biome_base_jsonc, ref_vite_config_base_ts, ref_vitest_config_base_ts, ref_mise_toml [INFERRED 0.85]
- **CI Quality Gate Pipeline (type-check/check/build)** — _github_workflows_ci, _github_workflows_pr_check, _github_workflows_validate, package_scripts_check, package_scripts_type_check [INFERRED 0.85]
- **npm Scripts / CLI Dependencies manifest hub** — package, package_scripts, package_scripts_cli, package_dependencies, package_bin_katsu_config [EXTRACTED 0.90]
- **Package Exports public subpath set** — package_exports, package_exports_math, package_exports_package_json, package_exports_biome, package_exports_mise, package_exports_oxlint, package_exports_tsconfig, package_exports_vite, package_exports_vitest [EXTRACTED 0.90]
- **tsconfig.base.json triple-identity split** — tsconfig_base, package_json_ref_tsconfig_base_json, tsconfig_json_ref_tsconfig_base_json [EXTRACTED 0.90]
- **Config base/consumer 2-node islands** — vite_config, vite_config_base, vitest_config, vitest_config_base, oxlint_json_oxlint, oxlint_base [EXTRACTED 0.90]
- **Cross-layer bridge gap (docs vs implementation)** — docs_cli_katsu_config, bin_cli_config_files, bin_config, package_exports, src_math [INFERRED 0.65]

## Communities (16 total, 0 thin omitted)

### Community 0 - "Documentation Hub"
Cohesion: 0.09
Nodes (49): Math Utilities API Reference, Biome Configuration Guide, Mise Configuration Guide, TypeScript Configuration Guide, Vite Configuration Guide, Vitest Configuration Guide, Config Inheritance Guide, Getting Started Guide (+41 more)

### Community 1 - "TypeScript Compiler Options"
Cohesion: 0.05
Nodes (44): DOM, DOM.Iterable, ES2022, compilerOptions, allowJs, allowSyntheticDefaultImports, allowUnreachableCode, allowUnusedLabels (+36 more)

### Community 2 - "Package Manager Utils"
Cohesion: 0.06
Nodes (34): collectScripts(), { collectScripts }, ensureCaretVersions(), fs, getProjectName(), hasPackageJson(), { log }, path (+26 more)

### Community 3 - "CI/CD and Release Docs"
Cohesion: 0.13
Nodes (32): Pull Request Template, Semantic Versioning Principle, CI Workflow, PR Check Workflow, Publish to npm Workflow, Validate Workflows, DEVELOPMENT.md - Developer Documentation, Conventional Commits Convention (+24 more)

### Community 4 - "Manifest and Dependencies"
Cohesion: 0.11
Nodes (23): Dependabot Configuration, @clack/prompts, commander, Scripts-to-CLI-Dependencies manifest bridge finding, Q: Why does scripts connect npm Scripts to CLI Dependencies?, ora, bin, dependencies (+15 more)

### Community 5 - "CLI Documentation and Analysis"
Cohesion: 0.12
Nodes (23): katsu-config CLI Documentation, Cross-Platform Support Principle, OXC Config Option (oxlint.json), Version-Pinned Installation Mechanism, TypeScript Configuration Doc, Q: tsconfig.base.json connections and edge-gap impact, tsconfig.base.json fragmentation finding, No-cross-layer-bridge finding (+15 more)

### Community 6 - "CLI Error Handling"
Cohesion: 0.12
Nodes (18): listCommand(), { showConfigList }, showConfigList(), { cancel }, handleError(), setupProcessHandlers(), { theme }, fs (+10 more)

### Community 7 - "Dev Dependencies and AI Docs"
Cohesion: 0.15
Nodes (17): CLAUDE.md - AI Developer Instructions, Dynamic Environment Setup Mechanism, oxfmt, devDependencies, oxfmt, oxlint, @types/node, typescript (+9 more)

### Community 8 - "Update Command Flow"
Cohesion: 0.17
Nodes (15): {
  CONFIG_FILES,
  checkConfigFileStatus,
  applyConfigFile,
  updateGitignore,
  collectDependencies,
}, { getExistingProjectConfigSelection }, { globalOptions }, { handleError }, { installDependencies }, { outro, isCancel, cancel, log }, {
  showIntro,
  showConfigFileStatus,
  showResults,
  showAvailableCommands,
}, { theme } (+7 more)

### Community 9 - "Init Command Flow"
Cohesion: 0.16
Nodes (14): { createViteProject, installDependencies, applyConfigFiles }, { getProjectNameInput, getConfigFileSelection }, { globalOptions }, { handleError }, initCommand(), { outro }, path, { showIntro, showProjectResults, showCompletionMessage } (+6 more)

### Community 10 - "Project Services"
Cohesion: 0.17
Nodes (13): applyConfigFile(), CONFIG_FILES (config-files-data), applyConfigFiles(), { CONFIG_FILES, applyConfigFile }, createViteProject(), { globalOptions }, installDependencies(), { log } (+5 more)

### Community 11 - "Config Data and Display"
Cohesion: 0.15
Nodes (10): CONFIG_FILES, packageRoot, path, { CONFIG_FILES }, getPackageVersion(), { globalOptions }, { intro, outro, log }, { packageRoot } (+2 more)

### Community 12 - "Config File Registry"
Cohesion: 0.21
Nodes (12): addPatternsToGitignore(), collectDependencies(), { CONFIG_FILES, packageRoot }, fs, getExistingGitignorePatterns(), getLibraryVersions(), getTemplateGitignore(), { globalOptions } (+4 more)

### Community 13 - "Oxlint Config"
Cohesion: 0.21
Nodes (8): Q: Do biome/oxlint/vite/vitest/mise show the same fragmentation pattern as tsconfig?, $schema, rules, no-console, no-debugger, $schema, node:path, vite

### Community 14 - "Interactive Prompts"
Cohesion: 0.29
Nodes (10): validateConfigIds(), { CONFIG_FILES }, getConfigFileSelection(), getExistingProjectConfigSelection(), getLinterSelection(), getNonLinterConfigs(), { globalOptions }, { text, select, multiselect, isCancel, cancel } (+2 more)

### Community 15 - "Spinner and Theme UI"
Cohesion: 0.24
Nodes (8): createSpinner(), oraModule, { theme }, withSpinner(), pc, theme, ora, picocolors

## Knowledge Gaps
- **157 isolated node(s):** `path`, `{ outro }`, `{ theme }`, `{ showIntro, showProjectResults, showCompletionMessage }`, `{ getProjectNameInput, getConfigFileSelection }` (+152 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `compilerOptions` connect `TypeScript Compiler Options` to `Documentation Hub`, `CLI Documentation and Analysis`?**
  _High betweenness centrality (0.223) - this node is a cross-community bridge._
- **Why does `tsconfig.base.json fragmentation finding` connect `CLI Documentation and Analysis` to `Documentation Hub`, `TypeScript Compiler Options`?**
  _High betweenness centrality (0.181) - this node is a cross-community bridge._
- **Why does `DEVELOPMENT.md - Developer Documentation` connect `CI/CD and Release Docs` to `Documentation Hub`, `Package Manager Utils`, `Manifest and Dependencies`, `CLI Error Handling`, `Update Command Flow`, `Init Command Flow`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `DEVELOPMENT.md - Developer Documentation` (e.g. with `math.ts` and `config.test.js`) actually correct?**
  _`DEVELOPMENT.md - Developer Documentation` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `katsu-config CLI Documentation` (e.g. with `@clack/prompts` and `ora`) actually correct?**
  _`katsu-config CLI Documentation` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `Documentation Index` (e.g. with `katsu-config` and `add()`) actually correct?**
  _`Documentation Index` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `path`, `{ outro }`, `{ theme }` to the rest of the system?**
  _157 weakly-connected nodes found - possible documentation gaps or missing edges._