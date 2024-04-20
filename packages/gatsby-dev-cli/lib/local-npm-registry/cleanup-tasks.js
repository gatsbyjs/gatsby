"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.registerCleanupTask = registerCleanupTask;
var _signalExit = _interopRequireDefault(require("signal-exit"));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cleanupTasks = new Set();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function registerCleanupTask(taskFn) {
  cleanupTasks.add(taskFn);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return () => {
    const result = taskFn();
    cleanupTasks.delete(taskFn);
    return result;
  };
}
_signalExit.default.onExit(() => {
  if (cleanupTasks.size) {
    console.log(`Process exitted in middle of publishing - cleaning up`);
    cleanupTasks.forEach(taskFn => taskFn());
  }
});