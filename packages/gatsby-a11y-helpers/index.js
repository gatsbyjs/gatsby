"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.RouteFocus = exports.RouteAnnouncement = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

/**
 * Announce
 *
 * Renders a wrapping div around content to announce on client side route change
 *
 */
var RouteAnnouncement = function RouteAnnouncement(_ref) {
  var children = _ref.children,
      props = (0, _objectWithoutPropertiesLoose2.default)(_ref, ["children"]);
  // TODO: adapt visually hidden in useEffect ?
  return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({}, props, {
    "data-gatsby-route-announcement": true
  }), children);
};

exports.RouteAnnouncement = RouteAnnouncement;

////////////////////////////////////////////////////////////////////////////////

/**
 * RouteFocus
 *
 * Renders a div that should wrap a small, interactive element (ideally a skip link) 
 * placed at the top of the page that Gatsby will detect and send focus to on 
 * client side route changes
 */
var RouteFocus = function RouteFocus(_ref2) {
  var children = _ref2.children,
      props = (0, _objectWithoutPropertiesLoose2.default)(_ref2, ["children"]);
  // TODO: adapt visually hidden in useEffect ?
  return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({}, props, {
    "data-gatsby-csr-focus": true
  }), children);
};

exports.RouteFocus = RouteFocus;