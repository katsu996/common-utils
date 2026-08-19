const oraModule = require("ora");
const { theme } = require("./theme");
const ora = oraModule.default || oraModule;

function createSpinner(text, dependencies = {}) {
  const { oraFn = ora, themeModule = theme } = dependencies;
  return oraFn({
    text: themeModule.muted(text),
    spinner: "dots",
    color: "cyan",
  });
}

function withSpinner(text, fn, dependencies = {}) {
  const { themeModule = theme } = dependencies;
  const spinner = createSpinner(text, dependencies);
  spinner.start();
  return Promise.resolve()
    .then(() => fn(spinner))
    .then(
      (result) => {
        spinner.succeed(themeModule.success(text));
        return result;
      },
      (error) => {
        spinner.fail(themeModule.error(text));
        throw error;
      },
    );
}

module.exports = { createSpinner, withSpinner };
