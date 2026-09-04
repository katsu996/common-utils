const globalOptions = {
  config: null,
  skipInstall: false,
  dryRun: false,
  skipGitignore: false,
};

function setGlobalOptions(options) {
  if (options.config !== undefined) globalOptions.config = options.config;
  if (options.skipInstall !== undefined) globalOptions.skipInstall = options.skipInstall;
  if (options.dryRun !== undefined) globalOptions.dryRun = options.dryRun;
  if (options.skipGitignore !== undefined) globalOptions.skipGitignore = options.skipGitignore;
}

module.exports = { globalOptions, setGlobalOptions };
