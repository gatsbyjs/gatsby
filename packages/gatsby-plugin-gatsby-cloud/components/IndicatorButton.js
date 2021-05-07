"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _IndicatorButtonTooltip = _interopRequireDefault(require("./IndicatorButtonTooltip"));

const spinnerIcon = /*#__PURE__*/_react.default.createElement("svg", {
  width: "28",
  height: "28",
  viewBox: "0 0 28 28",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, /*#__PURE__*/_react.default.createElement("mask", {
  id: "mask0",
  "mask-type": "alpha",
  maskUnits: "userSpaceOnUse",
  x: "0",
  y: "0",
  width: "28",
  height: "28"
}, /*#__PURE__*/_react.default.createElement("mask", {
  id: "mask1",
  maskUnits: "userSpaceOnUse",
  x: "0",
  y: "14",
  width: "28",
  height: "14"
}, /*#__PURE__*/_react.default.createElement("path", {
  d: "M14 28C21.732 28 28 21.732 28 14L-4.20265e-07 14C-1.24156e-06 21.732 6.26801 28 14 28Z",
  fill: "#232129"
})), /*#__PURE__*/_react.default.createElement("g", {
  mask: "url(#mask1)"
}, /*#__PURE__*/_react.default.createElement("path", {
  "fill-rule": "evenodd",
  "clip-rule": "evenodd",
  d: "M13.999 28C21.731 28 27.999 21.732 27.999 14C27.999 6.26801 21.731 0 13.999 0C6.26704 0 -0.000976562 6.26801 -0.000976562 14C-0.000976562 21.732 6.26704 28 13.999 28ZM13.9988 25.2001C20.1844 25.2001 25.1989 20.1857 25.1989 14.0001C25.1989 7.81452 20.1844 2.80011 13.9988 2.80011C7.81325 2.80011 2.79883 7.81452 2.79883 14.0001C2.79883 20.1857 7.81325 25.2001 13.9988 25.2001Z",
  fill: "#2DE3DA"
})), /*#__PURE__*/_react.default.createElement("mask", {
  id: "mask2",
  maskUnits: "userSpaceOnUse",
  x: "0",
  y: "0",
  width: "28",
  height: "28"
}, /*#__PURE__*/_react.default.createElement("path", {
  "fill-rule": "evenodd",
  "clip-rule": "evenodd",
  d: "M14 28C21.732 28 28 21.732 28 14C28 6.26801 21.732 0 14 0C6.26801 0 0 6.26801 0 14C0 21.732 6.26801 28 14 28ZM13.9996 25.2001C20.1852 25.2001 25.1996 20.1857 25.1996 14.0001C25.1996 7.81452 20.1852 2.80011 13.9996 2.80011C7.814 2.80011 2.79958 7.81452 2.79958 14.0001C2.79958 20.1857 7.814 25.2001 13.9996 25.2001Z",
  fill: "#2DE3DA"
})), /*#__PURE__*/_react.default.createElement("g", {
  mask: "url(#mask2)"
}, /*#__PURE__*/_react.default.createElement("path", {
  d: "M14 0C6.26801 0 0 6.26801 0 14L28 14C28 6.26801 21.732 0 14 0Z",
  fill: "url(#paint0_linear)"
}))), /*#__PURE__*/_react.default.createElement("g", {
  mask: "url(#mask0)"
}, /*#__PURE__*/_react.default.createElement("circle", {
  cx: "14",
  cy: "14",
  r: "14",
  fill: "#8A4BAF"
})), /*#__PURE__*/_react.default.createElement("defs", null, /*#__PURE__*/_react.default.createElement("linearGradient", {
  id: "paint0_linear",
  x1: "5.25",
  y1: "14",
  x2: "22.75",
  y2: "14",
  gradientUnits: "userSpaceOnUse"
}, /*#__PURE__*/_react.default.createElement("stop", {
  "stop-color": "#663399",
  "stop-opacity": "0"
}), /*#__PURE__*/_react.default.createElement("stop", {
  offset: "1"
}))));

const IndicatorButton = ({
  toolTipOffset,
  isFirstButton,
  tooltipText,
  overrideShowTooltip = false,
  tooltipLink,
  tooltipIcon,
  tooltipLinkImage,
  iconSvg,
  onClick,
  showSpinner,
  active = false
}) => {
  const [showTooltip, setShowTooltip] = (0, _react.useState)(false);
  const marginTop = isFirstButton ? '0px' : '8px';

  const onMouseEnter = () => setShowTooltip(true);

  const onMouseLeave = () => setShowTooltip(false);

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    "data-gatsby-preview-indicator": "button",
    "data-gatsby-preview-indicator-active-button": `${active}`,
    "data-gatsby-preview-indicator-hoverable": active && !isFirstButton ? "true" : "false",
    style: {
      marginTop: marginTop
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    onMouseEnter: onMouseEnter,
    onMouseLeave: onMouseLeave,
    onClick: onClick
  }, iconSvg, showSpinner && /*#__PURE__*/_react.default.createElement("div", {
    "data-gatsby-preview-indicator": "spinner"
  }, spinnerIcon))), tooltipText && /*#__PURE__*/_react.default.createElement(_IndicatorButtonTooltip.default, {
    tooltipText: tooltipText,
    overrideShowTooltip: overrideShowTooltip,
    showTooltip: showTooltip,
    tooltipIcon: tooltipIcon,
    toolTipOffset: toolTipOffset,
    tooltipLink: tooltipLink,
    tooltipLinkImage: tooltipLinkImage,
    onClick: onClick
  }));
};

var _default = IndicatorButton;
exports.default = _default;