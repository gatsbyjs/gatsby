"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.createLabel = exports.ColorSwitcher = void 0;

var _react = _interopRequireDefault(require("react"));

var _ink = require("ink");

const ColorSwitcher = ({
  children,
  ...props
}) => /*#__PURE__*/_react.default.createElement(_ink.Color, props, children);

exports.ColorSwitcher = ColorSwitcher;

const createLabel = (text, color) => (...props) => /*#__PURE__*/_react.default.createElement(ColorSwitcher, {
  [color]: true,
  ...props
}, text);

exports.createLabel = createLabel;