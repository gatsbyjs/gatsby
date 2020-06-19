"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.Message = void 0;

var _react = _interopRequireDefault(require("react"));

var _ink = require("ink");

var _utils = require("./utils");

var _constants = require("../../../constants");

const getLabel = level => {
  switch (level) {
    case _constants.ActivityLogLevels.Success:
    case _constants.LogLevels.Success:
      return (0, _utils.createLabel)(`success`, `green`);

    case _constants.LogLevels.Warning:
      return (0, _utils.createLabel)(`warn`, `yellow`);

    case _constants.LogLevels.Debug:
      return (0, _utils.createLabel)(`verbose`, `gray`);

    case _constants.LogLevels.Info:
      return (0, _utils.createLabel)(`info`, `blue`);

    case _constants.ActivityLogLevels.Failed:
      return (0, _utils.createLabel)(`failed`, `red`);

    case _constants.ActivityLogLevels.Interrupted:
      return (0, _utils.createLabel)(`not finished`, `gray`);

    default:
      return (0, _utils.createLabel)(level, `blue`);
  }
};

const Message = /*#__PURE__*/_react.default.memo(({
  level,
  text,
  duration,
  statusText
}) => {
  let message = text;

  if (duration) {
    message += ` - ${duration.toFixed(3)}s`;
  }

  if (statusText) {
    message += ` - ${statusText}`;
  }

  if (!level || level === `LOG`) {
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, message);
  }

  const TextLabel = getLabel(level);
  return /*#__PURE__*/_react.default.createElement(_ink.Box, {
    textWrap: "wrap",
    flexDirection: "row"
  }, /*#__PURE__*/_react.default.createElement(TextLabel, null), ` `, message);
});

exports.Message = Message;