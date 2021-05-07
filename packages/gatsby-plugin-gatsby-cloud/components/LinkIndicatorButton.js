"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = LinkIndicatorButton;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireWildcard(require("react"));

var _IndicatorButton = _interopRequireDefault(require("./IndicatorButton"));

const linkIcon = /*#__PURE__*/_react.default.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, /*#__PURE__*/_react.default.createElement("path", {
  d: "M3.9 12C3.9 10.29 5.29 8.9 7 8.9L11 8.9V7L7 7C4.24 7 2 9.24 2 12C2 14.76 4.24 17 7 17H11V15.1L7 15.1C5.29 15.1 3.9 13.71 3.9 12ZM8 13L16 13V11L8 11V13ZM17 7L13 7V8.9H17C18.71 8.9 20.1 10.29 20.1 12C20.1 13.71 18.71 15.1 17 15.1H13V17H17C19.76 17 22 14.76 22 12C22 9.24 19.76 7 17 7Z",
  fill: "#635E69"
}));

const successIcon = /*#__PURE__*/_react.default.createElement("svg", {
  style: {
    marginRight: '5px'
  },
  width: "11",
  height: "11",
  viewBox: "0 0 19 19",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, /*#__PURE__*/_react.default.createElement("path", {
  d: "M9.49968 1.5835C5.12967 1.5835 1.58301 5.13016 1.58301 9.50016C1.58301 13.8702 5.12967 17.4168 9.49968 17.4168C13.8697 17.4168 17.4163 13.8702 17.4163 9.50016C17.4163 5.13016 13.8697 1.5835 9.49968 1.5835ZM7.91634 13.4585L3.95801 9.50016L5.07426 8.38391L7.91634 11.2181L13.9251 5.20933L15.0413 6.3335L7.91634 13.4585Z",
  fill: "#2CA72C"
}));

const getButtonProps = ({
  status,
  copyLinkClick,
  button
}) => {
  switch (status) {
    case 'SUCCESS':
    case 'ERROR':
      {
        return {
          tooltipText: ""
        };
      }

    case 'BUILDING':
    case 'UPTODATE':
    default:
      {
        return {
          tooltipText: (button === null || button === void 0 ? void 0 : button.tooltipText) || "Copy link",
          onClick: copyLinkClick,
          overrideShowTooltip: button === null || button === void 0 ? void 0 : button.overrideShowTooltip,
          tooltipIcon: button === null || button === void 0 ? void 0 : button.tooltipIcon,
          active: true
        };
      }
  }
};

function LinkIndicatorButton({
  status
}) {
  const [button, setButton] = (0, _react.useState)();

  const copyLinkClick = () => {
    setButton({
      tooltipIcon: successIcon,
      overrideShowTooltip: true,
      tooltipText: 'Link copied'
    });
    setTimeout(() => {
      setButton({
        tooltipIcon: successIcon,
        tooltipText: 'Link copied',
        overrideShowTooltip: false
      });
    }, 2000);
    setTimeout(() => {
      setButton({
        tooltipText: 'Copy Link'
      });
    }, 2400);
    navigator.clipboard.writeText(window.location.href);
  };

  const buttonProps = getButtonProps({
    status,
    copyLinkClick,
    button
  });
  return /*#__PURE__*/_react.default.createElement(_IndicatorButton.default, (0, _extends2.default)({
    iconSvg: linkIcon
  }, buttonProps, {
    toolTipOffset: 40 + 12
  }));
}