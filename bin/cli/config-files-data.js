#!/usr/bin/env node

const path = require("node:path");

const packageRoot = path.resolve(__dirname, "../..");

const CONFIG_FILES = [
  {
    id: "typescript",
    label: "TypeScript設定 (tsconfig.json)",
    source: path.resolve(packageRoot, "tsconfig.base.json"),
    destination: "tsconfig.json",
    dependencies: ["typescript", "@types/node"],
    scripts: {
      "type-check": "tsc --noEmit",
    },
    contentModifier: (content) => {
      return content;
    },
  },
  {
    id: "biome",
    label: "Biome設定 (biome.jsonc)",
    source: path.resolve(packageRoot, "biome.base.jsonc"),
    destination: "biome.jsonc",
    dependencies: ["@biomejs/biome"],
    scripts: {
      lint: "biome lint .",
      "lint:fix": "biome lint --write .",
      check: "biome check .",
      "check:fix": "biome check --write .",
      format: "biome format --write .",
      "format:check": "biome format .",
    },
    contentModifier: (content) => {
      return content;
    },
  },
  {
    id: "mise",
    label: "Mise設定 (mise.toml)",
    source: path.resolve(packageRoot, "mise.toml"),
    destination: "mise.toml",
    dependencies: [],
    scripts: {},
  },
  {
    id: "vite",
    label: "Vite設定 (vite.config.ts)",
    source: path.resolve(packageRoot, "vite.config.base.ts"),
    destination: "vite.config.ts",
    dependencies: [],
    scripts: {},
    contentModifier: (content) => {
      return content;
    },
  },
  {
    id: "vitest",
    label: "Vitest設定 (vitest.config.ts)",
    source: path.resolve(packageRoot, "vitest.config.base.ts"),
    destination: "vitest.config.ts",
    dependencies: ["vitest", "@vitest/coverage-v8"],
    scripts: {
      test: "vitest",
      "test:watch": "vitest --watch",
      "test:coverage": "vitest --coverage",
    },
    contentModifier: (content) => {
      return content;
    },
  },
  {
    id: "gitignore",
    label: ".gitignore設定",
    source: null,
    destination: ".gitignore",
    dependencies: [],
    scripts: {},
    isSpecial: true,
  },
];

module.exports = { CONFIG_FILES, packageRoot };
