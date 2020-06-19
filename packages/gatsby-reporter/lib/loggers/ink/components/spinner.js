"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.Spinner = Spinner;

var _react = _interopRequireDefault(require("react"));

var _ink = require("ink");

var _inkSpinner = _interopRequireDefault(require("ink-spinner"));

function Spinner({
  text,
  statusText
}) {
  let label = text;

  if (statusText) {
    label += ` — ${statusText}`;
  }

  return /*#__PURE__*/_react.default.createElement(_ink.Box, null, /*#__PURE__*/_react.default.createElement(_inkSpinner.default, {
    type: "dots"
  }), " ", label);
}