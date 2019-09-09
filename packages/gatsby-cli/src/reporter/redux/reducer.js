const { Actions, ActivityLogLevels } = require(`../constants`)

module.exports = (
  state = {
    messages: [],
    activities: {},
    statefulMessages: [],
    status: ``,
  },
  action
) => {
  if (action.type === Actions.SetStatus) {
    state = {
      ...state,
      status: action.payload,
    }
  } else if (action.type === Actions.Log) {
    if (!action.payload.text) {
      action.payload.text = `\u2800`
    }

    state = {
      ...state,
      messages: [...state.messages, action.payload],
    }
  } else if (action.type === ActivityLogLevels.Start) {
    const { id } = action.payload
    state = {
      ...state,
      activities: {
        ...state.activities,
        [id]: action.payload,
      },
    }
  } else if (
    action.type === ActivityLogLevels.Update ||
    action.type === ActivityLogLevels.Pending
  ) {
    const { id, ...rest } = action.payload
    const activity = state.activities[id]

    state = {
      ...state,
      activities: {
        ...state.activities,
        [id]: {
          ...activity,
          ...rest,
        },
      },
    }
  } else if (
    action.type === ActivityLogLevels.End ||
    action.type === ActivityLogLevels.Cancel
  ) {
    const { id, status, duration } = action.payload
    const activity = state.activities[id]
    if (!activity) {
      return state
    }

    const activities = { ...state.activities }
    activities[id] = {
      ...activity,
      status,
      duration,
    }

    state = {
      ...state,
      activities,
    }
  } else if (action.type === Actions.SetLogs) {
    state = action.payload
  } else if (action.type === Actions.StatefulLog) {
    state = {
      ...state,
      statefulMessages: [...state.statefulMessages, action.payload],
    }
  } else if (action.type === Actions.ClearStatefulLog) {
    state = {
      ...state,
      statefulMessages: state.statefulMessages.filter(
        msg => msg.group !== action.payload
      ),
    }
  }

  return state
}
