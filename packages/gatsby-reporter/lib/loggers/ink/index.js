"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.initializeINKLogger = initializeINKLogger;

var _react = _interopRequireWildcard(require("react"));

var _ink = require("ink");

var _context = _interopRequireWildcard(require("./context"));

var _cli = _interopRequireDefault(require("./cli"));

const ConnectedCLI = () => {
  var _state$program, _state$program$_, _state$program2;

  const state = (0, _react.useContext)(_context.default);
  const showStatusBar = ((_state$program = state.program) === null || _state$program === void 0 ? void 0 : (_state$program$_ = _state$program._) === null || _state$program$_ === void 0 ? void 0 : _state$program$_[0]) === `develop` && ((_state$program2 = state.program) === null || _state$program2 === void 0 ? void 0 : _state$program2.status) === `BOOTSTRAP_FINISHED`;
  return /*#__PURE__*/_react.default.createElement(_cli.default, {
    showStatusBar: Boolean(showStatusBar),
    logs: state.logs
  });
};

function initializeINKLogger() {
  (0, _ink.render)( /*#__PURE__*/_react.default.createElement(_context.StoreStateProvider, null, /*#__PURE__*/_react.default.createElement(ConnectedCLI, null)));
}