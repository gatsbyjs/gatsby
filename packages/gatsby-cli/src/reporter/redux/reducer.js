module.exports = (
  state = {
    messages: [],
    activities: {},
    statefulMessages: [],
    status: `IN_PROGRESS`,
  },
  action
) => {
  if (action.type === `SET_STATUS`) {
    state = {
      ...state,
      status: action.payload,
    }
  } else if (action.type === `LOG`) {
    if (!action.payload.text) {
      action.payload.text = `\u2800`
    }

    state = {
      ...state,
      messages: [...state.messages, action.payload],
    }
  } else if (action.type === `ACTIVITY_START`) {
    const { id } = action.payload
    state = {
      ...state,
      activities: {
        ...state.activities,
        [id]: action.payload,
      },
    }
  } else if (action.type === `ACTIVITY_UPDATE`) {
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
  } else if (action.type === `ACTIVITY_END`) {
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
  } else if (action.type === `SET_LOGS`) {
    state = action.payload
  } else if (action.type === `STATEFUL_LOG`) {
    state = {
      ...state,
      statefulMessages: [...state.statefulMessages, action.payload],
    }
  } else if (action.type === `CLEAR_STATEFUL_LOG`) {
    state = {
      ...state,
      statefulMessages: state.statefulMessages.filter(
        msg => msg.group !== action.payload
      ),
    }
  }

  return state
}
