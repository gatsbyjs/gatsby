"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _ink = require("ink");

var _gatsbyTelemetry = require("gatsby-telemetry");

var _spinner = require("./components/spinner");

var _progressBar = require("./components/progress-bar");

var _messages = require("./components/messages");

var _error = require("./components/error");

var _develop = _interopRequireDefault(require("./components/develop"));

var _constants = require("../../constants");

var _gatsbyCoreUtils = require("gatsby-core-utils");

// Some CI pipelines incorrectly report process.stdout.isTTY status,
// which causes unwanted lines in the output. An additional check for isCI helps.
// @see https://github.com/prettier/prettier/blob/36aeb4ce4f620023c8174e826d7208c0c64f1a0b/src/utils/is-tty.js
const showProgress = process.stdout.isTTY && !(0, _gatsbyCoreUtils.isCI)();

class CLI extends _react.default.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      hasError: false
    };
    this.memoizedReactElementsForMessages = [];
  }

  componentDidCatch(error, info) {
    (0, _gatsbyTelemetry.trackBuildError)(`INK`, {
      error: {
        stack: info.componentStack,
        text: error.message,
        context: {}
      }
    });
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  render() {
    const {
      logs: {
        messages,
        activities
      },
      showStatusBar
    } = this.props;
    const {
      hasError,
      error
    } = this.state;

    if (hasError && error) {
      // You can render any custom fallback UI
      return /*#__PURE__*/_react.default.createElement(_ink.Box, {
        flexDirection: "row"
      }, /*#__PURE__*/_react.default.createElement(_messages.Message, {
        level: _constants.ActivityLogLevels.Failed,
        text: `We've encountered an error: ${error.message}`
      }));
    }
    /*
      Only operation on messages array is to push new message into it. Once
      message is there it can't change. Because of that we can do single
      transform from message object to react element and store it.
      This will avoid calling React.createElement completely for every message
      that can't change.
    */


    if (messages.length > this.memoizedReactElementsForMessages.length) {
      for (let index = this.memoizedReactElementsForMessages.length; index < messages.length; index++) {
        const msg = messages[index];
        this.memoizedReactElementsForMessages.push(msg.level === `ERROR` ? /*#__PURE__*/_react.default.createElement(_error.Error, {
          details: msg,
          key: index
        }) : /*#__PURE__*/_react.default.createElement(_messages.Message, (0, _extends2.default)({
          key: index
        }, msg)));
      }
    }

    const spinners = [];
    const progressBars = [];

    if (showProgress) {
      Object.keys(activities).forEach(activityName => {
        const activity = activities[activityName];

        if (activity.status !== `IN_PROGRESS`) {
          return;
        }

        if (activity.type === `spinner`) {
          spinners.push(activity);
        }

        if (activity.type === `progress` && activity.startTime) {
          progressBars.push(activity);
        }
      });
    }

    return /*#__PURE__*/_react.default.createElement(_ink.Box, {
      flexDirection: "column"
    }, /*#__PURE__*/_react.default.createElement(_ink.Box, {
      flexDirection: "column"
    }, /*#__PURE__*/_react.default.createElement(_ink.Static, null, this.memoizedReactElementsForMessages), spinners.map(activity => /*#__PURE__*/_react.default.createElement(_spinner.Spinner, (0, _extends2.default)({
      key: activity.id
    }, activity))), progressBars.map(activity => /*#__PURE__*/_react.default.createElement(_progressBar.ProgressBar, {
      key: activity.id,
      message: activity.text,
      total: activity.total || 0,
      current: activity.current || 0,
      startTime: activity.startTime || [0, 0]
    }))), showStatusBar && /*#__PURE__*/_react.default.createElement(_develop.default, null));
  }

}

var _default = CLI;
exports.default = _default;