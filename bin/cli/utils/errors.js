const { cancel } = require("@clack/prompts");
const { theme } = require("../ui/theme");

function createErrorHandlers(dependencies = {}) {
  const {
    cancelFn = cancel,
    themeModule = theme,
    processRef = process,
    consoleRef = console,
  } = dependencies;

  function handleError(error) {
    // Normalize non-Error rejection reasons (including undefined, null, strings, etc.)
    const normalizedError = error instanceof Error
      ? error
      : new Error(typeof error === "string" ? error : String(error ?? "Unknown error"));

    if (normalizedError.name === "CancelError" || normalizedError.message === "cancel") {
      cancelFn(themeModule.warning("設定をキャンセルしました"));
      processRef.exit(0);
      return;
    }
    consoleRef.error(
      `\n${themeModule.error("予期しないエラー:")} ${normalizedError.message}`,
    );
    processRef.exit(1);
  }

  function setupProcessHandlers() {
    processRef.on("SIGINT", () => {
      cancelFn(themeModule.warning("設定をキャンセルしました"));
      processRef.exit(0);
    });
    processRef.on("uncaughtException", handleError);
    processRef.on("unhandledRejection", handleError);
  }

  return { handleError, setupProcessHandlers };
}

const errorHandlers = createErrorHandlers();

module.exports = { createErrorHandlers, ...errorHandlers };
