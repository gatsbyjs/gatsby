"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.RouteFocus = exports.Announce = void 0;

var _react = _interopRequireDefault(require("react"));

var Announce = function Announce(props) {
  return /*#__PURE__*/_react.default.createElement("div", {
    id: "gatsby-route-announcement"
  }, props.children);
};

exports.Announce = Announce;

var RouteFocus = function RouteFocus(props) {
  return /*#__PURE__*/_react.default.createElement("div", {
    id: "gatsby-csr-focus-wrapper"
  }, props.children);
};

exports.RouteFocus = RouteFocus;