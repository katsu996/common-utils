import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

const rootDirectory = process.cwd();
const summaryRelativePath = "coverage/coverage-summary.json";
const metricNames = ["statements", "branches", "functions", "lines"];
const skippedDirectories = new Set([".git", "build", "coverage", "dist", "node_modules"]);

async function findPackages(directory) {
  const packages = [];
  const packageJsonPath = resolve(directory, "package.json");

  if (existsSync(packageJsonPath)) {
    packages.push(directory);
  }

  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || skippedDirectories.has(entry.name)) {
      continue;
    }

    packages.push(...(await findPackages(resolve(directory, entry.name))));
  }

  return packages;
}

function formatPercentage(covered, total) {
  if (total === 0) {
    return "—";
  }

  return `${((covered / total) * 100).toFixed(2)}%`;
}

function getMetric(summary, metricName, packageLabel) {
  const metric = summary.total?.[metricName];
  if (!metric || !Number.isFinite(metric.covered) || !Number.isFinite(metric.total)) {
    throw new Error(`${packageLabel} の ${metricName} 集計値を読み取れません。`);
  }

  return { covered: metric.covered, total: metric.total };
}

function createRow(label, metrics) {
  return `| ${label} | ${metricNames
    .map((metricName) => {
      const metric = metrics[metricName];
      return `${formatPercentage(metric.covered, metric.total)} (${metric.covered}/${metric.total})`;
    })
    .join(" | ")} |`;
}

const packageDirectories = await findPackages(rootDirectory);
const reports = [];

for (const packageDirectory of packageDirectories) {
  const summaryPath = resolve(packageDirectory, summaryRelativePath);
  if (!existsSync(summaryPath)) {
    continue;
  }

  const [packageJson, coverageSummary] = await Promise.all([
    readFile(resolve(packageDirectory, "package.json"), "utf8").then(JSON.parse),
    readFile(summaryPath, "utf8").then(JSON.parse),
  ]);
  const relativePath = relative(rootDirectory, packageDirectory) || ".";
  const packageLabel = packageJson.name ? `${packageJson.name} (${relativePath})` : relativePath;
  const metrics = Object.fromEntries(
    metricNames.map((metricName) => [
      metricName,
      getMetric(coverageSummary, metricName, packageLabel),
    ]),
  );

  reports.push({ label: packageLabel, metrics });
}

if (reports.length === 0) {
  console.error(`カバレッジサマリーが見つかりません: ${summaryRelativePath}`);
  process.exitCode = 1;
} else {
  const totals = Object.fromEntries(
    metricNames.map((metricName) => [metricName, { covered: 0, total: 0 }]),
  );

  for (const report of reports) {
    for (const metricName of metricNames) {
      totals[metricName].covered += report.metrics[metricName].covered;
      totals[metricName].total += report.metrics[metricName].total;
    }
  }

  console.log("## テストカバレッジ");
  console.log("");
  console.log("| パッケージ | Statements | Branches | Functions | Lines |");
  console.log("| --- | ---: | ---: | ---: | ---: |");
  for (const report of reports) {
    console.log(createRow(report.label, report.metrics));
  }
  console.log(createRow("**全体（加重集計）**", totals));
}
