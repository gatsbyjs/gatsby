"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.startLogger = void 0;

var _semver = _interopRequireDefault(require("semver"));

var _gatsbyCoreUtils = require("gatsby-core-utils");

var _ipc = require("./loggers/ipc");

var _json = require("./loggers/json");

var _yurnalist = require("./loggers/yurnalist");

var _ink = require("./loggers/ink");

/*
 * This module is a side-effect filled module to load in the proper logger.
 */
const startLogger = () => {
  let inkExists = false;

  try {
    inkExists = !!require.resolve(`ink`); // eslint-disable-next-line no-empty
  } catch (err) {}

  if (!process.env.GATSBY_LOGGER) {
    if (inkExists && _semver.default.satisfies(process.version, `>=8`) && !(0, _gatsbyCoreUtils.isCI)() && typeof jest === `undefined`) {
      process.env.GATSBY_LOGGER = `ink`;
    } else {
      process.env.GATSBY_LOGGER = `yurnalist`;
    }
  } // if child process - use ipc logger


  if (process.send) {
    // process.env.FORCE_COLOR = `0`
    (0, _ipc.initializeIPCLogger)();
  }

  if (process.env.GATSBY_LOGGER.includes(`json`)) {
    (0, _json.initializeJSONLogger)();
  } else if (process.env.GATSBY_LOGGER.includes(`yurnalist`)) {
    (0, _yurnalist.initializeYurnalistLogger)();
  } else {
    (0, _ink.initializeINKLogger)();
  }
};

exports.startLogger = startLogger;