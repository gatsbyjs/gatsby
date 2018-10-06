"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _react = _interopRequireDefault(require("react"));

var _cxs = _interopRequireDefault(require("cxs"));

var _jsxFileName = "/Users/ctxhou/Program/Github/gatsby/packages/gatsby-plugin-cxs/src/gatsby-ssr.js";

exports.onRenderBody = function (_ref) {
  var setHeadComponents = _ref.setHeadComponents;

  var css = _cxs.default.css();

  setHeadComponents([_react.default.createElement("style", {
    id: "cxs-ids",
    key: "cxs-ids",
    dangerouslySetInnerHTML: {
      __html: css
    },
    __source: {
      fileName: _jsxFileName,
      lineNumber: 7
    },
    __self: this
  })]);
};