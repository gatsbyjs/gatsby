"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _ink = require("ink");

var _context = _interopRequireDefault(require("../context"));

var _constants = require("../../../constants");

var _utils = require("./utils");

const getLabel = level => {
  switch (level) {
    case _constants.ActivityStatuses.InProgress:
      return (0, _utils.createLabel)(`In Progress`, `white`);

    case _constants.ActivityStatuses.Interrupted:
      return (0, _utils.createLabel)(`Interrupted`, `gray`);

    case _constants.ActivityStatuses.Failed:
      return (0, _utils.createLabel)(`Failed`, `red`);

    case _constants.ActivityStatuses.Success:
      return (0, _utils.createLabel)(`Success`, `green`);

    default:
      return (0, _utils.createLabel)(level, `white`);
  }
}; // Track the width and height of the terminal. Responsive app design baby!


const useTerminalResize = () => {
  const {
    stdout
  } = (0, _react.useContext)(_ink.StdoutContext);
  const [sizes, setSizes] = (0, _react.useState)([stdout.columns, stdout.rows]);
  (0, _react.useEffect)(() => {
    const resizeListener = () => {
      setSizes([stdout.columns, stdout.rows]);
    };

    stdout.on(`resize`, resizeListener);
    return () => {
      stdout.off(`resize`, resizeListener);
    };
  }, [stdout]);
  return sizes;
};

const Develop = ({
  pagesCount,
  appName,
  status
}) => {
  const [width] = useTerminalResize();
  const StatusLabel = getLabel(status);
  return /*#__PURE__*/_react.default.createElement(_ink.Box, {
    flexDirection: "column",
    marginTop: 2
  }, /*#__PURE__*/_react.default.createElement(_ink.Box, {
    textWrap: `truncate`
  }, `—`.repeat(width)), /*#__PURE__*/_react.default.createElement(_ink.Box, {
    height: 1,
    flexDirection: "row"
  }, /*#__PURE__*/_react.default.createElement(StatusLabel, null), /*#__PURE__*/_react.default.createElement(_ink.Box, {
    flexGrow: 1
  }), /*#__PURE__*/_react.default.createElement(_ink.Color, null, appName), /*#__PURE__*/_react.default.createElement(_ink.Box, {
    flexGrow: 1
  }), /*#__PURE__*/_react.default.createElement(_ink.Color, null, pagesCount, " pages")));
};

const ConnectedDevelop = () => {
  var _state$pages, _state$program, _state$logs;

  const state = (0, _react.useContext)(_context.default);
  return /*#__PURE__*/_react.default.createElement(Develop, {
    pagesCount: ((_state$pages = state.pages) === null || _state$pages === void 0 ? void 0 : _state$pages.size) || 0,
    appName: ((_state$program = state.program) === null || _state$program === void 0 ? void 0 : _state$program.sitePackageJson.name) || ``,
    status: ((_state$logs = state.logs) === null || _state$logs === void 0 ? void 0 : _state$logs.status) || ``
  });
};

var _default = ConnectedDevelop;
exports.default = _default;