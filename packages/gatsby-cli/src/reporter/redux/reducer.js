module.exports = (
  state = {
    messages: [],
    activities: {},
    statefulMessages: [],
    status: `IN_PROGRESS`,
  },
  action
) => {
  if (action.type === `STRUCTURED_LOG`) {
    action.payload.timestamp = new Date().toJSON()
    if (!action.payload.text) {
      action.payload.text = `\u2800`
    }

    state = {
      ...state,
      messages: [...state.messages, action.payload],
    }
  } else if (action.type === `STRUCTURED_ACTIVITY_START`) {
    const { id } = action.payload
    state = {
      ...state,
      activities: {
        ...state.activities,
        [id]: {
          state: `IN_PROGRESS`,
          status: ``,
          startTime: process.hrtime(),
          ...action.payload,
        },
      },
      status: `IN_PROGRESS`,
    }
  } else if (action.type === `STRUCTURED_ACTIVITY_UPDATE`) {
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
  } else if (action.type === `STRUCTURED_ACTIVITY_END`) {
    const { id } = action.payload
    const activity = state.activities[id]
    if (!activity) {
      return state
    }

    const activities = { ...state.activities }
    activities[id] = {
      ...activity,
      state: action.payload.state || `SUCCESS`,
    }

    let messages = state.messages

    if (!activity.dontShowSuccess) {
      let text = activity.name
      if (action.payload.status) {
        text += ` - ${action.payload.status}`
      }
      if (action.payload.elapsedTime) {
        text += ` - ${action.payload.elapsedTime} s`
      }

      const successLog = {
        level: action.payload.state || `SUCCESS`,
        timestamp: new Date().toJSON(),
        text,
      }

      messages = [...messages, successLog]
    }
    state = {
      ...state,
      activities,
      messages,
      status: Object.keys(activities).reduce((acc, key) => {
        const activity = activities[key]
        if (
          activity.state === `IN_PROGRESS` ||
          activity.state === `NOT_STARTED`
        ) {
          return `IN_PROGRESS`
        } else if (activity.state === `FAILED` && acc !== `IN_PROGRESS`) {
          return `FAILED`
        }
        return acc
      }, `SUCCESS`),
    }
  } else if (action.type === `STRUCTURED_ACTIVITY_TICK`) {
    const { id } = action.payload
    const activity = state.activities[id]

    state = {
      ...state,
      activities: {
        ...state.activities,
        [id]: {
          ...activity,
          current: activity.current + 1,
        },
      },
    }
  } else if (action.type === `INIT_STRUCTURED_LOGS`) {
    state = action.payload
  } else if (action.type === `STATEFUL_LOG`) {
    action.payload.timestamp = new Date().toJSON()
    state = {
      ...state,
      statefulMessages: [...state.statefulMessages, action.payload],
    }
  } else if (action.type === `CLEAR_STATEFUL_LOG`) {
    state = {
      ...state,
      statefulMessages: state.statefulMessages.filter(
        msg => msg.group !== action.payload.group
      ),
    }
  }

  return state
}
