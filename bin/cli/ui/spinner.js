const oraModule = require("ora");
const { theme } = require("./theme");

const ora = oraModule.default || oraModule;

function createSpinner(text) {
  return ora({
    text: theme.muted(text),
    spinner: "dots",
    color: "cyan",
  });
}

function withSpinner(text, fn) {
  const spinner = createSpinner(text);
  spinner.start();
  return Promise.resolve().then(() => fn(spinner)).then(
    (result) => {
      spinner.succeed(theme.success(text));
      return result;
    },
    (error) => {
      spinner.fail(theme.error(text));
      throw error;
    },
  );
}

module.exports = { createSpinner, withSpinner };
