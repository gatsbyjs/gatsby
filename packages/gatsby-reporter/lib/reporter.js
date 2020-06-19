"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.reporter = exports.Reporter = void 0;

var _commonTags = require("common-tags");

var _chalk = _interopRequireDefault(require("chalk"));

var _gatsbyTelemetry = require("gatsby-telemetry");

var _opentracing = require("opentracing");

var _getErrorFormater = require("./get-error-formater");

var reporterActions = _interopRequireWildcard(require("./redux/actions"));

var _constants = require("./constants");

var _constructError = _interopRequireDefault(require("./structured-errors/construct-error"));

var _catchExitSignals = require("./catch-exit-signals");

var _reporterTimer = require("./reporter-timer");

var _reporterPhantom = require("./reporter-phantom");

var _reporterProgress = require("./reporter-progress");

const errorFormatter = (0, _getErrorFormater.getErrorFormatter)();
const tracer = (0, _opentracing.globalTracer)();
let isVerbose = false;
/**
 * Reporter module.
 * @module reporter
 */

class Reporter {
  constructor() {
    this.stripIndent = _commonTags.stripIndent;
    this.format = _chalk.default;

    this.setVerbose = (_isVerbose = true) => {
      isVerbose = _isVerbose;
    };

    this.setNoColor = (isNoColor = false) => {
      if (isNoColor) {
        errorFormatter.withoutColors();
      } // disables colors in popular terminal output coloring packages
      //  - chalk: see https://www.npmjs.com/package/chalk#chalksupportscolor
      //  - ansi-colors: see https://github.com/doowb/ansi-colors/blob/8024126c7115a0efb25a9a0e87bc5e29fd66831f/index.js#L5-L7


      if (isNoColor) {
        process.env.FORCE_COLOR = `0`; // chalk determines color level at import time. Before we reach this point,
        // chalk was already imported, so we need to retroactively adjust level

        _chalk.default.level = 0;
      }
    };

    this.panic = (errorMeta, error) => {
      const reporterError = this.error(errorMeta, error);
      (0, _gatsbyTelemetry.trackError)(`GENERAL_PANIC`, {
        error: reporterError
      });
      (0, _catchExitSignals.prematureEnd)();
      return process.exit(1);
    };

    this.panicOnBuild = (errorMeta, error) => {
      const reporterError = this.error(errorMeta, error);
      (0, _gatsbyTelemetry.trackError)(`BUILD_PANIC`, {
        error: reporterError
      });

      if (process.env.gatsby_executing_command === `build`) {
        (0, _catchExitSignals.prematureEnd)();
        process.exit(1);
      }

      return reporterError;
    };

    this.error = (errorMeta, error) => {
      let details = {
        context: {}
      }; // Many paths to retain backcompat :scream:
      // 1.
      //   reporter.error(any, Error);
      //   reporter.error(any, [Error]);

      if (error) {
        if (Array.isArray(error)) {
          return error.map(errorItem => this.error(errorMeta, errorItem));
        }

        details.error = error;
        details.context = {
          sourceMessage: errorMeta + ` ` + error.message
        }; // 2.
        //    reporter.error(Error);
      } else if (errorMeta instanceof Error) {
        details.error = errorMeta;
        details.context = {
          sourceMessage: errorMeta.message
        }; // 3.
        //    reporter.error([Error]);
      } else if (Array.isArray(errorMeta)) {
        // when we get an array of messages, call this function once for each error
        return errorMeta.map(errorItem => this.error(errorItem)); // 4.
        //    reporter.error(errorMeta);
      } else if (typeof errorMeta === `object`) {
        details = { ...errorMeta
        }; // 5.
        //    reporter.error('foo');
      } else if (typeof errorMeta === `string`) {
        details.context = {
          sourceMessage: errorMeta
        };
      }

      const structuredError = (0, _constructError.default)({
        details
      });

      if (structuredError) {
        reporterActions.createLog(structuredError);
      } // TODO: remove this once Error component can render this info
      // log formatted stacktrace


      if (structuredError.error) {
        this.log(errorFormatter.render(structuredError.error));
      }

      return structuredError;
    };

    this.uptime = prefix => {
      this.verbose(`${prefix}: ${(process.uptime() * 1000).toFixed(3)}ms`);
    };

    this.verbose = text => {
      if (isVerbose) {
        reporterActions.createLog({
          level: _constants.LogLevels.Debug,
          text
        });
      }
    };

    this.success = text => reporterActions.createLog({
      level: _constants.LogLevels.Success,
      text
    });

    this.info = text => reporterActions.createLog({
      level: _constants.LogLevels.Info,
      text
    });

    this.warn = text => reporterActions.createLog({
      level: _constants.LogLevels.Warning,
      text
    });

    this.log = text => reporterActions.createLog({
      level: _constants.LogLevels.Log,
      text
    });

    this.pendingActivity = reporterActions.createPendingActivity;

    this.completeActivity = (id, status = _constants.ActivityStatuses.Success) => {
      reporterActions.endActivity({
        id,
        status
      });
    };

    this.activityTimer = (text, activityArgs = {}) => {
      let {
        parentSpan,
        id,
        tags
      } = activityArgs;
      const spanArgs = parentSpan ? {
        childOf: parentSpan,
        tags
      } : {
        tags
      };

      if (!id) {
        id = text;
      }

      const span = tracer.startSpan(text, spanArgs);
      return (0, _reporterTimer.createTimerReporter)({
        text,
        id,
        span,
        reporter: this
      });
    };

    this.phantomActivity = (text, activityArgs = {}) => {
      let {
        parentSpan,
        id,
        tags
      } = activityArgs;
      const spanArgs = parentSpan ? {
        childOf: parentSpan,
        tags
      } : {
        tags
      };

      if (!id) {
        id = text;
      }

      const span = tracer.startSpan(text, spanArgs);
      return (0, _reporterPhantom.createPhantomReporter)({
        id,
        text,
        span
      });
    };

    this.createProgress = (text, total = 0, start = 0, activityArgs = {}) => {
      let {
        parentSpan,
        id,
        tags
      } = activityArgs;
      const spanArgs = parentSpan ? {
        childOf: parentSpan,
        tags
      } : {
        tags
      };

      if (!id) {
        id = text;
      }

      const span = tracer.startSpan(text, spanArgs);
      return (0, _reporterProgress.createProgressReporter)({
        id,
        text,
        total,
        start,
        span,
        reporter: this
      });
    };

    this._setStage = () => {};
  }

}

exports.Reporter = Reporter;
const reporter = new Reporter();
exports.reporter = reporter;