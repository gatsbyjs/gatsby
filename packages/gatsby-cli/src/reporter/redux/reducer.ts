import { ActionsUnion, IGatsbyCLIState, ISetLogs } from "./types"
import { Actions } from "../constants"

export const reducer = (
  state: IGatsbyCLIState = {
    messages: [],
    activities: {},
    status: ``,
  },
  action: ActionsUnion | ISetLogs
): IGatsbyCLIState => {
  switch (action.type) {
    case Actions.SetStatus: {
      return {
        ...state,
        status: action.payload,
      }
    }

    case Actions.Log: {
      if (!action.payload.text) {
        // set empty character to fix ink
        action.payload.text = `\u2800`
      }

      return {
        ...state,
        messages: [...state.messages, action.payload],
      }
    }

    case Actions.StartActivity: {
      const { id } = action.payload
      return {
        ...state,
        activities: {
          ...state.activities,
          [id]: action.payload,
        },
      }
    }

    case Actions.UpdateActivity:
    case Actions.PendingActivity: {
      const { id, ...rest } = action.payload
      const activity = state.activities[id]

      return {
        ...state,
        activities: {
          ...state.activities,
          [id]: {
            ...activity,
            id,
            ...rest,
          },
        },
      }
    }
    case Actions.ActivityErrored: {
      const { id } = action.payload
      const activity = state.activities[id]

      return {
        ...state,
        activities: {
          ...state.activities,
          [id]: {
            ...activity,
            errored: true,
          },
        },
      }
    }

    case Actions.EndActivity:
    case Actions.CancelActivity: {
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

      return {
        ...state,
        activities,
      }
    }

    case Actions.SetLogs: {
      return action.payload
    }
  }

  return state
}
