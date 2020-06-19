"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.createPhantomReporter = void 0;

var reporterActions = _interopRequireWildcard(require("./redux/actions"));

var _constants = require("./constants");

const createPhantomReporter = ({
  text,
  id,
  span
}) => {
  return {
    start() {
      reporterActions.startActivity({
        id,
        text,
        type: _constants.ActivityTypes.Hidden
      });
    },

    end() {
      span.finish();
      reporterActions.endActivity({
        id,
        status: _constants.ActivityStatuses.Success
      });
    },

    span
  };
};

exports.createPhantomReporter = createPhantomReporter;