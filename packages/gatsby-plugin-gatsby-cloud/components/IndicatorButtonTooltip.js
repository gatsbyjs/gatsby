"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

const IndicatorButtonTooltip = ({
  onClick,
  tooltipLinkImage,
  tooltipLink,
  overrideShowTooltip,
  showTooltip,
  tooltipText,
  tooltipIcon,
  toolTipOffset
}) => {
  return /*#__PURE__*/_react.default.createElement("div", {
    onClick: onClick,
    style: {
      top: `${toolTipOffset}px`
    },
    "data-gatsby-preview-indicator": "tooltip",
    "data-gatsby-preview-indicator-visible": `${overrideShowTooltip || showTooltip}`
  }, tooltipIcon, tooltipText, tooltipLink && /*#__PURE__*/_react.default.createElement("p", {
    "data-gatsby-preview-indicator": "tooltip-link"
  }, tooltipLink), tooltipLinkImage && /*#__PURE__*/_react.default.createElement("div", {
    "data-gatsby-preview-indicator": "tooltip-svg"
  }, tooltipLinkImage));
};

var _default = IndicatorButtonTooltip;
exports.default = _default;