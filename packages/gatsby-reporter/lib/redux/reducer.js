"use strict";

exports.__esModule = true;
exports.reducer = void 0;

var _constants = require("../constants");

const reducer = (state = {
  messages: [],
  activities: {},
  status: ``
}, action) => {
  switch (action.type) {
    case _constants.Actions.SetStatus:
      {
        return { ...state,
          status: action.payload
        };
      }

    case _constants.Actions.Log:
      {
        if (!action.payload.text) {
          // set empty character to fix ink
          action.payload.text = `\u2800`;
        }

        return { ...state,
          messages: [...state.messages, action.payload]
        };
      }

    case _constants.Actions.StartActivity:
      {
        const {
          id
        } = action.payload;
        return { ...state,
          activities: { ...state.activities,
            [id]: action.payload
          }
        };
      }

    case _constants.Actions.UpdateActivity:
    case _constants.Actions.PendingActivity:
      {
        const {
          id,
          ...rest
        } = action.payload;
        const activity = state.activities[id];
        return { ...state,
          activities: { ...state.activities,
            [id]: { ...activity,
              ...rest
            }
          }
        };
      }

    case _constants.Actions.ActivityErrored:
      {
        const {
          id
        } = action.payload;
        const activity = state.activities[id];
        return { ...state,
          activities: { ...state.activities,
            [id]: { ...activity,
              errored: true
            }
          }
        };
      }

    case _constants.Actions.EndActivity:
    case _constants.Actions.CancelActivity:
      {
        const {
          id,
          status,
          duration
        } = action.payload;
        const activity = state.activities[id];

        if (!activity) {
          return state;
        }

        const activities = { ...state.activities
        };
        activities[id] = { ...activity,
          status,
          duration
        };
        return { ...state,
          activities
        };
      }

    case _constants.Actions.SetLogs:
      {
        return action.payload;
      }
  }

  return state;
};

exports.reducer = reducer;