module.exports = (
  state = {
    messages: [],
    activities: {},
    statefulMessages: [],
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

    let messages = state.messages

    if (!activity.dontShowSuccess) {
      let text = name
      if (action.payload.status) {
        text += ` - ${action.payload.status}`
      }
      if (action.payload.elapsedTime) {
        text += ` - ${action.payload.elapsedTime} s`
      }

      const successLog = {
        level: `SUCCESS`,
        timestamp: new Date().toJSON(),
        text,
      }

      messages = [...messages, successLog]
    }

    state = {
      ...state,
      activities,
      messages,
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
    // const statefulMessages = { ...state.statefulMessages }
    // delete statefulMessages[action.payload.id]
    // state = {
    //   ...state,
    //   statefulMessages,
    // }
  }

  return state
}
