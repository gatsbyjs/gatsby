"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.Error = void 0;

var _react = _interopRequireDefault(require("react"));

var _path = _interopRequireDefault(require("path"));

var _ink = require("ink");

const File = ({
  filePath,
  location
}) => {
  const lineNumber = location === null || location === void 0 ? void 0 : location.start.line;
  let locString = ``;

  if (typeof lineNumber !== `undefined`) {
    locString += `:${lineNumber}`;
    const columnNumber = location === null || location === void 0 ? void 0 : location.start.column;

    if (typeof columnNumber !== `undefined`) {
      locString += `:${columnNumber}`;
    }
  }

  return /*#__PURE__*/_react.default.createElement(_ink.Color, {
    blue: true
  }, _path.default.relative(process.cwd(), filePath), locString);
};

const DocsLink = ({
  docsUrl
}) => {
  // TODO: when there's no specific docsUrl, add helpful message describing how
  // to submit an issue
  if (docsUrl === `https://gatsby.dev/issue-how-to`) return null;
  return /*#__PURE__*/_react.default.createElement(_ink.Box, {
    marginTop: 1
  }, "See our docs page for more info on this error: ", docsUrl);
};

const Error = /*#__PURE__*/_react.default.memo(({
  details
}) =>
/*#__PURE__*/
// const stackLength = get(details, `stack.length`, 0
_react.default.createElement(_ink.Box, {
  marginY: 1,
  flexDirection: "column"
}, /*#__PURE__*/_react.default.createElement(_ink.Box, {
  flexDirection: "column"
}, /*#__PURE__*/_react.default.createElement(_ink.Box, {
  flexDirection: "column"
}, /*#__PURE__*/_react.default.createElement(_ink.Box, null, /*#__PURE__*/_react.default.createElement(_ink.Box, {
  marginRight: 1
}, /*#__PURE__*/_react.default.createElement(_ink.Color, {
  black: true,
  bgRed: true
}, ` ${details.level} `, details.code ? `#${details.code} ` : ``), /*#__PURE__*/_react.default.createElement(_ink.Color, {
  red: true
}, details.type ? ` ` + details.type : ``))), /*#__PURE__*/_react.default.createElement(_ink.Box, {
  marginTop: 1
}, details.text), details.filePath && /*#__PURE__*/_react.default.createElement(_ink.Box, {
  marginTop: 1
}, "File:", ` `, /*#__PURE__*/_react.default.createElement(File, {
  filePath: details.filePath,
  location: details.location
}))), /*#__PURE__*/_react.default.createElement(DocsLink, {
  docsUrl: details.docsUrl
}))));

exports.Error = Error;