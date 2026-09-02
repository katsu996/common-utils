const pc = require("picocolors");

const theme = {
  brand: (text) => pc.inverse(` ${text} `),
  heading: (text) => pc.bold(text),
  success: (text) => pc.green(text),
  error: (text) => pc.red(text),
  warning: (text) => pc.yellow(text),
  info: (text) => pc.cyan(text),
  muted: (text) => pc.gray(text),
  dim: (text) => pc.dim(text),
  highlight: (text) => pc.cyan(text),
  path: (text) => pc.cyan(text),
  command: (text) => pc.cyan(text),
  label: (text) => pc.bold(text),
  title: (text) => pc.inverse(` ${text} `),
  symbol: {
    success: pc.green("✓"),
    error: pc.red("✗"),
    warning: pc.yellow("⚠"),
    info: pc.cyan("ℹ"),
    arrow: pc.dim("→"),
    bullet: pc.dim("•"),
  },
};

module.exports = { theme, pc };
