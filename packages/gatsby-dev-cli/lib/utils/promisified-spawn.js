"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.promisifiedSpawn = promisifiedSpawn;
exports.setDefaultSpawnStdio = setDefaultSpawnStdio;
var _execa = _interopRequireDefault(require("execa"));
const defaultSpawnArgs = {
  cwd: process.cwd(),
  stdio: `inherit`
};
function setDefaultSpawnStdio(stdio) {
  // @ts-ignore
  defaultSpawnArgs.stdio = stdio;
}
async function promisifiedSpawn([cmd, args = [], spawnArgs = {}]) {
  const spawnOptions = {
    ...defaultSpawnArgs,
    ...spawnArgs
  };
  try {
    return await _execa.default.execa(cmd, args, spawnOptions);
  } catch (e) {
    if (spawnOptions.stdio === `ignore`) {
      console.log(`\nCommand "${cmd} ${args.join(` `)}" failed.\nTo see details of failed command, rerun "gatsby-dev" without "--quiet" or "-q" switch\n`);
    }
    throw e;
  }
}