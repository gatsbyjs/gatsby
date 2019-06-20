module.exports = (
  state = {
    messages: [],
    activities: {},
    statefulMessages: {},
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
    const { name } = action.payload
    state = {
      ...state,
      activities: {
        ...state.activities,
        [name]: {
          status: ``,
          startTime: process.hrtime(),
          ...action.payload,
        },
      },
    }
  } else if (action.type === `STRUCTURED_ACTIVITY_UPDATE`) {
    const { name, ...rest } = action.payload
    const activity = state.activities[name]

    state = {
      ...state,
      activities: {
        ...state.activities,
        [name]: {
          ...activity,
          ...rest,
        },
      },
    }
  } else if (action.type === `STRUCTURED_ACTIVITY_END`) {
    const { name } = action.payload
    const activity = state.activities[name]
    if (!activity) {
      return state
    }

    const activities = { ...state.activities }
    delete activities[name]

    let text = name
    if (action.payload.status) {
      text += ` - ${action.payload.status}`
    }
    if (action.payload.elapsedTime) {
      text += ` - ${action.payload.elapsedTime} s`
    }

    const successLog = {
      type: `success`,
      timestamp: new Date().toJSON(),
      text,
    }

    state = {
      ...state,
      activities,
      messages: [...state.messages, successLog],
    }
  } else if (action.type === `STRUCTURED_ACTIVITY_TICK`) {
    const { name } = action.payload
    const activity = state.activities[name]

    state = {
      ...state,
      activities: {
        ...state.activities,
        [name]: {
          ...activity,
          current: activity.current + 1,
        },
      },
    }
  } else if (action.type === `INIT_STRUCTURED_LOGS`) {
    state = action.payload
  } else if (action.type === `STATEFUL_LOG`) {
    state = {
      ...state,
      statefulMessages: {
        ...state.errors,
        [action.payload.id]: action.payload,
      },
    }
  } else if (action.type === `CLEAR_STATEFUL_LOG`) {
    const statefulMessages = { ...state.statefulMessages }
    delete statefulMessages[action.payload.id]
    state = {
      ...state,
      statefulMessages,
    }
  }

  return state
}
