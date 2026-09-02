# Graph Report - common-utils (2026-09-02)

## Corpus Check

- 73 files · ~19,076 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 624 nodes · 906 edges · 41 communities (40 shown, 1 thin omitted)
- Extraction: 80% EXTRACTED · 19% INFERRED · 1% AMBIGUOUS · INFERRED: 174 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `ee5f3c32`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- Semantic Versioning Section
- compilerOptions
- Export Paths Table (5 config templates + inheritance method matrix)
- katsu-config CLI Tool
- package.json
- Release Process Documentation
- global-options.js
- config.js
- project.js
- scripts
- Getting Started Documentation
- init.js
- update.js
- runtime-support.unit.test.js
- devDependencies
- prompts.js
- display.js
- config.test.js
- tsconfig.json
- config-files.js
- package.js
- exports
- createPrompts
- Math Module
- coverage-summary.mjs
- sandbox-cli.js
- math.ts
- Biome Configuration
- Test Job
- rules
- oxlint.base.json
- Validate Workflows Workflow
- Mise Configuration
- CI Workflow
- Q: What is the exact relationship between Graphify Query Tool and Math Module?
- Q: How does Math Utilities Cohesive Module hyperedge connect docs and source?
- Q: What is the backbone connecting Graphify Knowledge Graph -> Project Structure -> CLI Architecture -> katsu-config CLI Tool?
- Q: Why is minimumReleaseAgeExclude for @biomejs/biome in TypeScript Strict Config instead of CI/CD?
- Graphify Knowledge Graph

## God Nodes (most connected - your core abstractions)

1. `compilerOptions` - 41 edges
2. `scripts` - 22 edges
3. `Export Paths Table (5 config templates + inheritance method matrix)` - 11 edges
4. `Biome Configuration` - 11 edges
5. `Release Process Documentation` - 11 edges
6. `globalOptions` - 10 edges
7. `files` - 10 edges
8. `theme` - 9 edges
9. `exports` - 9 edges
10. `TypeScript Configuration Documentation` - 9 edges

## Surprising Connections (you probably didn't know these)

- `Graphify Query Tool` --conceptually_related_to--> `Math Module` [AMBIGUOUS]
  AGENTS.md → docs/api/math.md
- `CI Pipeline Description` --conceptually_related_to--> `CI Workflow` [INFERRED]
  RELEASE.md → .github/workflows/ci.yml
- `Manual Biome Migration (create biome.jsonc extends, install @biomejs/biome, add lint/check/format scripts)` --shares_data_with--> `Biome Platform-Specific CLI Packages (darwin-arm64/x64, linux-musl/arm64/x64, win32-arm64/x64)` [AMBIGUOUS]
  docs/guides/migration.md → pnpm-workspace.yaml
- `Biome Platform-Specific CLI Packages (darwin-arm64/x64, linux-musl/arm64/x64, win32-arm64/x64)` --conceptually_related_to--> `Exports Subpaths as Islands (./biome, ./mise, ./oxlint, ./vite, ./vitest degree 1 single back-edge to exports c11)` [AMBIGUOUS]
  pnpm-workspace.yaml → graphify-out/memory/query_20260805_124753_do_biome_oxlint_vite_vitest_mise_show_the_same_fra.md
- `Base Branches Regex Pattern` --conceptually_related_to--> `CI Workflow` [INFERRED]
  .coderabbit.yaml → .github/workflows/ci.yml

## Import Cycles

- None detected.

## Hyperedges (group relationships)

- **Math Utilities Cohesive Module** — docs_api_math_add_function, docs_api_math_sub_function, docs_api_math_sum_function, docs_api_math_average_function, docs_api_math_clamp_function, docs_api_math_roundto_function, readme_utility_add, readme_utility_sub [EXTRACTED 1.00]
- **Release Pipeline Workflow (ci -> create-tag -> publish -> create-release)** — docs_development_release_ci_job, docs_development_release_create_tag_job, docs_development_release_publish_job, docs_development_release_create_release_job, docs_development_release_publish_workflow, docs_development_release_trusted_publisher, docs_development_contributing_semver, docs_development_contributing_quality_checks [EXTRACTED 1.00]
- **Shared Config Inheritance Flow (extends + mergeConfig + manual copy)** — docs_configuration_typescript_inheritance, docs_configuration_typescript_customization_example, docs_configuration_vite_mergeconfig_pattern, docs_configuration_vitest_base_config, docs_development_config_inheritance_tsconfig_extends, docs_development_config_inheritance_biome_extends, docs_development_config_inheritance_vite_mergeconfig, docs_development_config_inheritance_vitest_mergeconfig, docs_development_config_inheritance_mise_manual_copy, docs_getting_started_config_inheritance_summary, docs_guides_migration_cli_migration [EXTRACTED 1.00]
- **Configuration Ecosystem Group** — claude_supported_config_files, docs_cli_katsu_config_supported_files_table, docs_configuration_biome_biome_config, docs_configuration_mise_mise_config, readme_config_biome_inheritance, readme_config_typescript_inheritance, readme_config_mise_inheritance, readme_config_vite_inheritance, readme_config_vitest_inheritance [INFERRED 0.85]
- **Knowledge Graph Fragmentation Diagnosis (exports islands + tsconfig god node + doc-code gap)** — graphify_out_memory_query_20260805_122029_why_does_exports_connect_package_exports_to_cli_de_island_subpaths, graphify_out_memory_query_20260805_122253_tsconfig_base_json_connections_and_edge_gap_impact_god_node_compilerOptions, graphify_out_memory_query_20260805_122253_tsconfig_base_json_connections_and_edge_gap_impact_fragmentation_three_ids, graphify_out_memory_query_20260805_124753_do_biome_oxlint_vite_vitest_mise_show_the_same_fra_exports_islands, graphify_out_memory_query_20260805_124753_do_biome_oxlint_vite_vitest_mise_show_the_same_fra_vite_vitest_pairs, graphify_out_memory_query_20260805_125953_is_katsu_config_doc_the_only_cross_layer_bridge_to_disconnected_result, graphify_out_memory_query_20260805_125953_is_katsu_config_doc_the_only_cross_layer_bridge_to_doc_implementation_gap, docs_development_config_inheritance_export_paths_table [INFERRED 0.85]
- **CI/CD Pipeline Group** — _github_workflows_ci_ci_workflow, _github_workflows_pr_check_pr_check_workflow, _github_workflows_publish_publish_workflow, _github_workflows_validate_validate_workflow, release_ci_pipeline, release_publish_workflow_manual [INFERRED 0.95]

## Communities (41 total, 1 thin omitted)

### Community 0 - "Semantic Versioning Section"

Cohesion: 0.15
Nodes (16): Semantic Versioning Section, Create Release Job, Create Tag Job, Publish Job, Publish Workflow, Trusted Publisher OIDC, Version Bump Strategy, Release Simulation (+8 more)

### Community 1 - "compilerOptions"

Cohesion: 0.04
Nodes (44): DOM, DOM.Iterable, ES2022, compilerOptions, allowJs, allowSyntheticDefaultImports, allowUnreachableCode, allowUnusedLabels (+36 more)

### Community 2 - "Export Paths Table (5 config templates + inheritance method matrix)"

Cohesion: 0.09
Nodes (44): Customization Example (overriding noUnusedLocals), TypeScript Config Inheritance via extends, Path Alias @ -> src/, Application Mode Example (outDir build), Vite Base Config (@katsu996/common-utils/vite), Build Settings (target esnext, minify prod true/dev false, sourcemap dev true/prod false), Vite Configuration Documentation, Library Mode CJS Example (entry index/math, formats cjs, rollupOptions) (+36 more)

### Community 3 - "katsu-config CLI Tool"

Cohesion: 0.16
Nodes (19): ESM Module Configuration, Interactive UI with Clack, katsu-config CLI Tool, Dynamic Dependency Install, Dynamic Script Generation, Existing Project Mode, New Project Mode, Supported Config Files (+11 more)

### Community 4 - "package.json"

Cohesion: 0.05
Nodes (38): @clack/prompts, commander, ora, bin, katsu-config, dependencies, @clack/prompts, commander (+30 more)

### Community 5 - "Release Process Documentation"

Cohesion: 0.13
Nodes (30): Additional Strictness Checks (noUnusedLocals, noUnusedParameters, exactOptionalPropertyTypes, noImplicitReturns, noFallthroughCasesInSwitch, noUncheckedIndexedAccess, noImplicitOverride, noPropertyAccessFromIndexSignature), TypeScript Configuration Documentation, Module Settings (isolatedModules, verbatimModuleSyntax, esModuleInterop, resolveJsonModule, forceConsistentCasingInFileNames), Output Settings (declaration, declarationMap, sourceMap, removeComments), Strict TypeScript Base Config (@katsu996/common-utils/tsconfig), Strict Family Options (strictNullChecks, strictFunctionTypes, strictBindCallApply, strictPropertyInitialization, noImplicitAny, noImplicitThis, alwaysStrict), Target ES2022 + module ESNext + bundler resolution, Coding Conventions (strict TS via tsconfig.base.json, Biome via biome.jsonc, tests per feature) (+22 more)

### Community 6 - "global-options.js"

Cohesion: 0.08
Nodes (19): setGlobalOptions(), configFiles, require, { setGlobalOptions }, configFiles, require, { setGlobalOptions }, configFiles (+11 more)

### Community 7 - "config.js"

Cohesion: 0.08
Nodes (23): initCommand, createListCommand(), listCommand, { showConfigList }, updateCommand, showConfigList(), createProgram(), fs (+15 more)

### Community 8 - "project.js"

Cohesion: 0.10
Nodes (15): applyConfigFile(), { CONFIG_FILES, applyConfigFile }, createProjectService(), createViteProject(), installDependencies(), spawnAsync(), { globalOptions }, { log } (+7 more)

### Community 9 - "scripts"

Cohesion: 0.09
Nodes (22): scripts, audit, // Build, check, check:fix, cli, // Code Quality, coverage:summary (+14 more)

### Community 10 - "Getting Started Documentation"

Cohesion: 0.15
Nodes (21): Development Setup (git clone + pnpm install), CLI Usage (pnpm katsu-config, dlx, new-project caveat ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND), Config Inheritance Summary (tsconfig extends, biome extends array, vite/vitest mergeConfig snippets), Getting Started Documentation, Export Paths List (8 public subpaths: main, math, package.json, biome, mise, tsconfig, vite, vitest), Utility Quickstart (add, sum, clamp + subpath import @katsu996/common-utils/math), Requirements (Node >=24.19.0, pnpm >=11.21.0), Package Overview Documentation (@katsu996/common-utils) (+13 more)

### Community 11 - "init.js"

Cohesion: 0.12
Nodes (15): createInitCommand(), {
createViteProject,
installDependencies,
applyConfigFiles,
}, {
getProjectNameInput,
getConfigFileSelection,
}, { globalOptions }, { handleError }, { outro }, path, {
showIntro,
showProjectResults,
showCompletionMessage,
} (+7 more)

### Community 12 - "update.js"

Cohesion: 0.12
Nodes (14): {
CONFIG_FILES,
checkConfigFileStatus,
applyConfigFile,
updateGitignore,
collectDependencies,
}, createUpdateCommand(), { getExistingProjectConfigSelection }, { globalOptions }, { handleError }, { installDependencies }, { outro, isCancel, cancel, log }, {
showIntro,
showConfigFileStatus,
showResults,
showAvailableCommands,
} (+6 more)

### Community 13 - "runtime-support.unit.test.js"

Cohesion: 0.11
Nodes (20): createSpinner(), oraModule, { theme }, withSpinner(), pc, theme, { cancel }, createErrorHandlers() (+12 more)

### Community 14 - "devDependencies"

Cohesion: 0.12
Nodes (17): @biomejs/biome, oxfmt, devDependencies, @biomejs/biome, oxfmt, oxlint, @types/node, typescript (+9 more)

### Community 15 - "prompts.js"

Cohesion: 0.16
Nodes (12): CONFIG_FILES, packageRoot, path, validateConfigIds(), { CONFIG_FILES }, { globalOptions }, promptFunctions, {
text,
select,
multiselect,
isCancel,
cancel,
} (+4 more)

### Community 16 - "display.js"

Cohesion: 0.15
Nodes (11): { CONFIG_FILES }, getPackageVersion(), { globalOptions }, { intro, outro, log }, { packageRoot }, showAvailableCommands(), showConfigFileStatus(), showHelpMessage() (+3 more)

### Community 17 - "config.test.js"

Cohesion: 0.14
Nodes (10): {
CONFIG_FILES,
getLibraryVersions,
validateConfigIds,
checkConfigFileStatus,
applyConfigFile,
updateGitignore,
collectDependencies,
collectScripts,
}, __dirname, executeCommand(), __filename, {
getProjectNameInput,
getConfigFileSelection,
getExistingProjectConfigSelection,
}, { globalOptions }, {
hasPackageJson,
getProjectName,
validateProjectName,
updatePackageJsonExisting,
updatePackageJson,
}, require (+2 more)

### Community 18 - "tsconfig.json"

Cohesion: 0.14
Nodes (13): node_modules, src/**/*, tests, compilerOptions, noEmit, outDir, rootDir, skipLibCheck (+5 more)

### Community 19 - "config-files.js"

Cohesion: 0.21
Nodes (11): addPatternsToGitignore(), { CONFIG_FILES, packageRoot }, fs, getExistingGitignorePatterns(), getLibraryVersions(), getTemplateGitignore(), { globalOptions }, { log } (+3 more)

### Community 20 - "package.js"

Cohesion: 0.21
Nodes (12): collectScripts(), { collectScripts }, fs, getProjectName(), { globalOptions }, hasPackageJson(), { log }, mergeScripts() (+4 more)

### Community 21 - "exports"

Cohesion: 0.17
Nodes (12): exports, ./biome, ./math, ./mise, ./oxlint, ./package.json, ./tsconfig, ./vite (+4 more)

### Community 22 - "createPrompts"

Cohesion: 0.25
Nodes (8): createPrompts(), getConfigFileSelection(), getExistingProjectConfigSelection(), getLinterSelection(), getNonLinterConfigs(), configFiles, { createPrompts }, require

### Community 23 - "Math Module"

Cohesion: 0.39
Nodes (9): add Function, average Function, clamp Function, Math Module, roundTo Function, sub Function, sum Function, add Utility Function (+1 more)

### Community 24 - "coverage-summary.mjs"

Cohesion: 0.25
Nodes (6): createRow(), formatPercentage(), metricNames, reports, rootDirectory, skippedDirectories

### Community 25 - "sandbox-cli.js"

Cohesion: 0.22
Nodes (8): args, child, cliPath, fs, path, repoRoot, sandboxDir, { spawn }

### Community 26 - "math.ts"

Cohesion: 0.39
Nodes (6): add(), average(), clamp(), roundTo(), sub(), sum()

### Community 27 - "Biome Configuration"

Cohesion: 0.14
Nodes (18): Strict Biome Configuration, Project Structure, Strict TypeScript Configuration, OXC Config Support, Biome Configuration, Customization Example, Formatter Settings, Complexity Linter Rules (+10 more)

### Community 28 - "Test Job"

Cohesion: 0.27
Nodes (11): Change Types Checklist, Pull Request Template, Quality Checklist, Build Artifacts Upload, Codecov Integration, pnpm Setup Action, Test Job, Changed Files Detection (+3 more)

### Community 29 - "rules"

Cohesion: 0.40
Nodes (4): rules, no-console, no-debugger, $schema

### Community 33 - "Validate Workflows Workflow"

Cohesion: 0.24
Nodes (10): Auto Review Enabled, Package Exports Verification, Package.json Version Validation, PR Check Workflow, PR Comment Bot, Biome Config Validation, Package Exports Test, Package.json Validation (+2 more)

### Community 34 - "Mise Configuration"

Cohesion: 0.22
Nodes (10): Dependabot Configuration, GitHub Actions Ecosystem Updates, NPM Ecosystem Updates, Node Version Matrix, Dev Environment Setup, Mise Configuration, Node Version Pinning, pnpm Version Pinning (+2 more)

### Community 35 - "CI Workflow"

Cohesion: 0.40
Nodes (5): Base Branches Regex Pattern, CodeRabbit Configuration, CI Workflow, Security Job, CI Workflow Reuse

### Community 36 - "Q: What is the exact relationship between Graphify Query Tool and Math Module?"

Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: What is the exact relationship between Graphify Query Tool and Math Module?, Source Nodes

### Community 37 - "Q: How does Math Utilities Cohesive Module hyperedge connect docs and source?"

Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: How does Math Utilities Cohesive Module hyperedge connect docs and source?, Source Nodes

### Community 38 - "Q: What is the backbone connecting Graphify Knowledge Graph -> Project Structure -> CLI Architecture -> katsu-config CLI Tool?"

Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: What is the backbone connecting Graphify Knowledge Graph -> Project Structure -> CLI Architecture -> katsu-config CLI Tool?, Source Nodes

### Community 39 - "Q: Why is minimumReleaseAgeExclude for @biomejs/biome in TypeScript Strict Config instead of CI/CD?"

Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Why is minimumReleaseAgeExclude for @biomejs/biome in TypeScript Strict Config instead of CI/CD?, Source Nodes

### Community 40 - "Graphify Knowledge Graph"

Cohesion: 0.67
Nodes (3): Graphify Knowledge Graph, Graphify Query Tool, Graphify Update Command

## Ambiguous Edges - Review These

- `Auto Review Enabled` → `Biome Config Validation` [AMBIGUOUS]
  .coderabbit.yaml · relation: conceptually_related_to
- `NPM Ecosystem Updates` → `pnpm Version Pinning` [AMBIGUOUS]
  .github/dependabot.yml · relation: conceptually_related_to
- `FAQ Troubleshooting` → `Rollback Strategy` [AMBIGUOUS]
  README.md · relation: conceptually_related_to
- `Related Links (GitHub repo, npm package, Issue reporting)` → `Ten Cross-Community Edge Groups (CLI spine c0-c4-c5-c8 rich, manifest hub c2->c7/c9/c11/c8, docs c3<->c6)` [AMBIGUOUS]
  docs/index.md · relation: conceptually_related_to
- `Path Alias @ -> src/` → `Module Settings (isolatedModules, verbatimModuleSyntax, esModuleInterop, resolveJsonModule, forceConsistentCasingInFileNames)` [AMBIGUOUS]
  docs/configuration/typescript.md · relation: conceptually_related_to
- `Manual Biome Migration (create biome.jsonc extends, install @biomejs/biome, add lint/check/format scripts)` → `Biome Platform-Specific CLI Packages (darwin-arm64/x64, linux-musl/arm64/x64, win32-arm64/x64)` [AMBIGUOUS]
  docs/guides/migration.md · relation: shares_data_with
- `Exports Subpaths as Islands (./biome, ./mise, ./oxlint, ./vite, ./vitest degree 1 single back-edge to exports c11)` → `Biome Platform-Specific CLI Packages (darwin-arm64/x64, linux-musl/arm64/x64, win32-arm64/x64)` [AMBIGUOUS]
  pnpm-workspace.yaml · relation: conceptually_related_to
- `Math Module` → `Graphify Query Tool` [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to
- `OXC Config Support` → `Biome Configuration` [AMBIGUOUS]
  docs/cli/katsu-config.md · relation: conceptually_related_to
- `NPM_TOKEN Secret (automation type, required when OIDC unavailable)` → `minimumReleaseAgeExclude for @biomejs/biome packages` [AMBIGUOUS]
  docs/development/release.md · relation: shares_data_with

## Knowledge Gaps

- **277 isolated node(s):** `path`, `{ outro }`, `{ theme }`, `{
showIntro,
showProjectResults,
showCompletionMessage,
}`, `{
getProjectNameInput,
getConfigFileSelection,
}` (+272 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Known dead ends** — questions that led nowhere; don't re-derive.

- "Is katsu-config Doc the only cross-layer bridge to config-files.js?" -> `katsu-config Doc`, `config-files.js`
- "What is the exact relationship between Graphify Query Tool and Math Module?" -> `Graphify Query Tool`, `Math Module`

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Auto Review Enabled` and `Biome Config Validation`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `NPM Ecosystem Updates` and `pnpm Version Pinning`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `FAQ Troubleshooting` and `Rollback Strategy`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Related Links (GitHub repo, npm package, Issue reporting)` and `Ten Cross-Community Edge Groups (CLI spine c0-c4-c5-c8 rich, manifest hub c2->c7/c9/c11/c8, docs c3<->c6)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Path Alias @ -> src/` and `Module Settings (isolatedModules, verbatimModuleSyntax, esModuleInterop, resolveJsonModule, forceConsistentCasingInFileNames)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Manual Biome Migration (create biome.jsonc extends, install @biomejs/biome, add lint/check/format scripts)` and `Biome Platform-Specific CLI Packages (darwin-arm64/x64, linux-musl/arm64/x64, win32-arm64/x64)`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **What is the exact relationship between `Exports Subpaths as Islands (./biome, ./mise, ./oxlint, ./vite, ./vitest degree 1 single back-edge to exports c11)` and `Biome Platform-Specific CLI Packages (darwin-arm64/x64, linux-musl/arm64/x64, win32-arm64/x64)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
