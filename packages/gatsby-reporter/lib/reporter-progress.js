"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.createProgressReporter = void 0;

var reporterActions = _interopRequireWildcard(require("./redux/actions"));

var _constants = require("./constants");

const createProgressReporter = ({
  id,
  text,
  start,
  total,
  span,
  reporter
}) => {
  let lastUpdateTime = 0;
  let unflushedProgress = 0;
  let unflushedTotal = 0;
  const progressUpdateDelay = Math.round(1000 / 10); // 10 fps *shrug*

  const updateProgress = (forced = false) => {
    const t = Date.now();
    if (!forced && t - lastUpdateTime <= progressUpdateDelay) return;

    if (unflushedTotal > 0) {
      reporterActions.setActivityTotal({
        id,
        total: unflushedTotal
      });
      unflushedTotal = 0;
    }

    if (unflushedProgress > 0) {
      reporterActions.activityTick({
        id,
        increment: unflushedProgress
      });
      unflushedProgress = 0;
    }

    lastUpdateTime = t;
  };

  return {
    start() {
      reporterActions.startActivity({
        id,
        text,
        type: _constants.ActivityTypes.Progress,
        current: start,
        total
      });
    },

    setStatus(statusText) {
      reporterActions.setActivityStatusText({
        id,
        statusText
      });
    },

    tick(increment = 1) {
      unflushedProgress += increment; // Have to manually track this :/

      updateProgress();
    },

    panicOnBuild(errorMeta, error) {
      span.finish();
      reporterActions.setActivityErrored({
        id
      });
      return reporter.panicOnBuild(errorMeta, error);
    },

    panic(errorMeta, error) {
      span.finish();
      reporterActions.endActivity({
        id,
        status: _constants.ActivityStatuses.Failed
      });
      return reporter.panic(errorMeta, error);
    },

    end() {
      updateProgress(true);
      span.finish();
      reporterActions.endActivity({
        id,
        status: _constants.ActivityStatuses.Success
      });
    },

    // @deprecated - use end()
    done() {
      updateProgress(true);
      span.finish();
      reporterActions.endActivity({
        id,
        status: _constants.ActivityStatuses.Success
      });
    },

    set total(value) {
      unflushedTotal = value;
      updateProgress();
    },

    span
  };
};

exports.createProgressReporter = createProgressReporter;