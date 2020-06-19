"use strict";

exports.__esModule = true;
exports.reduxLogReducer = void 0;

var _startLogger = require("./start-logger");

var _patchConsole = require("./patch-console");

var _catchExitSignals = require("./catch-exit-signals");

var _reporter = require("./reporter");

exports.reporter = _reporter.reporter;

var _redux = require("./redux");

exports.setStore = _redux.setStore;

var _reducer = require("./redux/reducer");

var _types = require("./redux/types");

exports.IGatsbyCLIState = _types.IGatsbyCLIState;

var _types2 = require("./types");

exports.IActivityArgs = _types2.IActivityArgs;
exports.IPhantomReporter = _types2.IPhantomReporter;
exports.IProgressReporter = _types2.IProgressReporter;
(0, _catchExitSignals.catchExitSignals)();
(0, _startLogger.startLogger)();
(0, _patchConsole.patchConsole)(_reporter.reporter);
const reduxLogReducer = _reducer.reducer; // Types

exports.reduxLogReducer = reduxLogReducer;