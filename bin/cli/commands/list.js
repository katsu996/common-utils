const { showConfigList } = require("../ui/display");

function createListCommand(dependencies = {}) {
  const { showConfigListFn = showConfigList } = dependencies;
  return function listCommand() {
    showConfigListFn();
  };
}

const listCommand = createListCommand();

module.exports = { createListCommand, listCommand };
