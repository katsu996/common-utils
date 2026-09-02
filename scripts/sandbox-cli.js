#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const sandboxDir = path.join(repoRoot, "sandbox");

if (fs.existsSync(sandboxDir)) {
  fs.rmSync(sandboxDir, { recursive: true, force: true });
}
fs.mkdirSync(sandboxDir, { recursive: true });

const cliPath = path.join(repoRoot, "bin", "config.js");
const args = process.argv.slice(2);

const child = spawn("node", [cliPath, ...args], {
  cwd: sandboxDir,
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("close", (code) => {
  process.exit(code ?? 0);
});
