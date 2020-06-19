"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.initializeYurnalistLogger = initializeYurnalistLogger;

var _redux = require("../../redux");

var _constants = require("../../constants");

var _yurnalist = require("yurnalist");

var _progress = _interopRequireDefault(require("progress"));

var _chalk = _interopRequireDefault(require("chalk"));

function initializeYurnalistLogger() {
  const activities = {};
  const yurnalist = (0, _yurnalist.createReporter)({
    emoji: true,
    verbose: true
  });
  const levelToYurnalist = {
    [_constants.LogLevels.Log]: yurnalist.log.bind(yurnalist),
    [_constants.LogLevels.Warning]: yurnalist.warn.bind(yurnalist),
    [_constants.LogLevels.Error]: yurnalist.error.bind(yurnalist),
    [_constants.LogLevels.Info]: yurnalist.info.bind(yurnalist),
    [_constants.LogLevels.Success]: yurnalist.success.bind(yurnalist),
    [_constants.ActivityLogLevels.Success]: yurnalist.success.bind(yurnalist),
    [_constants.ActivityLogLevels.Failed]: text => {
      yurnalist.log(`${_chalk.default.red(`failed`)} ${text}`);
    },
    [_constants.ActivityLogLevels.Interrupted]: text => {
      yurnalist.log(`${_chalk.default.gray(`not finished`)} ${text}`);
    }
  };
  (0, _redux.onLogAction)(action => {
    switch (action.type) {
      case _constants.Actions.Log:
        {
          const yurnalistMethod = levelToYurnalist[action.payload.level];

          if (!yurnalistMethod) {
            process.stdout.write(`NO "${action.payload.level}" method\n`);
          } else {
            let message = action.payload.text;

            if (action.payload.duration) {
              message += ` - ${action.payload.duration.toFixed(3)}s`;
            }

            if (action.payload.statusText) {
              message += ` - ${action.payload.statusText}`;
            }

            yurnalistMethod(message);
          }

          break;
        }

      case _constants.Actions.StartActivity:
        {
          if (action.payload.type === _constants.ActivityTypes.Spinner) {
            const spinner = yurnalist.activity();
            spinner.tick(action.payload.text);
            const activity = {
              text: action.payload.text,
              statusText: action.payload.statusText,

              update(payload) {
                // TODO: I'm not convinced that this is ever called with a text property.
                // From searching the codebase it appears that we do not ever assign a text
                // property during the IUpdateActivity action.
                if (payload.text) {
                  activity.text = payload.text;
                }

                if (payload.statusText) {
                  activity.statusText = payload.statusText;
                }

                let message = activity.text;

                if (activity.statusText) {
                  message += ` - ${activity.statusText}`;
                }

                message += ` id:"${action.payload.id}"`;
                spinner.tick(message);
              },

              end() {
                spinner.end();
              }

            };
            activities[action.payload.id] = activity;
          } else if (action.payload.type === _constants.ActivityTypes.Progress) {
            const bar = new _progress.default(` [:bar] :current/:total :elapsed s :percent ${action.payload.text}`, {
              total: action.payload.total,
              curr: action.payload.current,
              width: 30,
              clear: true
            });
            activities[action.payload.id] = {
              text: undefined,
              statusText: undefined,

              update(payload) {
                if (payload.total) {
                  bar.total = payload.total;
                }

                if (payload.current) {
                  bar.curr = payload.current;
                }

                bar.tick(0);
              },

              end() {}

            };
          }

          break;
        }

      case _constants.Actions.UpdateActivity:
        {
          const activity = activities[action.payload.id];

          if (activity) {
            activity.update(action.payload);
          }

          break;
        }

      case _constants.Actions.EndActivity:
        {
          const activity = activities[action.payload.id];

          if (activity) {
            activity.end();
            delete activities[action.payload.id];
          }
        }
    }
  });
}