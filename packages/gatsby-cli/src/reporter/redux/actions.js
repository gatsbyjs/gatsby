// @flow
const uuidv4 = require(`uuid/v4`)
const convertHrtime = require(`convert-hrtime`)
const { trackCli } = require(`gatsby-telemetry`)
const { bindActionCreators } = require(`redux`)
const { dispatch, getStore } = require(`./index`)
const signalExit = require(`signal-exit`)

const getActivity = id => getStore().getState().logs.activities[id]

const getElapsedTimeMS = activity => {
  const elapsed = process.hrtime(activity.startTime)
  return convertHrtime(elapsed)[`seconds`].toFixed(3)
}

const verySpecialDebounce = (fn, waitingTime) => {
  let lastInvocationTime = 0
  let lastCalledStatus = undefined
  let lastActualledCalledStatus = undefined
  let timeoutHandle = undefined

  signalExit(() => {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
      if (lastCalledStatus !== lastActualledCalledStatus) {
        fn(lastCalledStatus)
      }
    }
  })

  const debounceHandler = status => {
    clearTimeout(timeoutHandle)
    timeoutHandle = null
    const currentTime = Date.now()
    const waitingEnough = currentTime - lastInvocationTime > waitingTime
    lastInvocationTime = currentTime
    lastCalledStatus = status

    if (waitingEnough) {
      if (lastCalledStatus !== lastActualledCalledStatus) {
        lastActualledCalledStatus = status
        fn(status)
      }
    } else {
      timeoutHandle = setTimeout(
        () => debounceHandler(status),
        currentTime - lastInvocationTime
      )
    }
  }

  return debounceHandler
}

const debouncedSetStatus = status =>
  verySpecialDebounce(dispatchFn => {
    dispatchFn({
      type: `SET_STATUS`,
      payload: status,
    })
  }, 1000)

const actions = {
  createLog: ({
    level,
    text,
    statusText,
    duration,
    group,
    code,
    type,
    filePath,
    location,
    docsUrl,
    context,
    activity_current,
    activity_total,
    activity_type,
    activity_uuid,
  }) => {
    return {
      type: `LOG`,
      payload: {
        level,
        text,
        statusText,
        duration,
        group,
        code,
        type,
        filePath,
        location,
        docsUrl,
        context,
        activity_current,
        activity_total,
        activity_type,
        activity_uuid,
        timestamp: new Date().toJSON(),
      },
    }
  },
  clearStatefulLogs: group => {
    return {
      type: `CLEAR_STATEFUL_LOG`,
      payload: group,
    }
  },
  createPendingActivity: ({ id, status = `NOT_STARTED` }) => {
    const actionsToEmit = []

    if (getStore().getState().logs.status !== `IN_PROGRESS`) {
      actionsToEmit.push(actions.setStatus(`IN_PROGRESS`))
    }

    actionsToEmit.push({
      type: `ACTIVITY_PENDING`,
      payload: {
        id,
        type: `pending`,
        status,
      },
    })

    return actionsToEmit
  },
  setStatus: status => debouncedSetStatus(status),
  startActivity: ({
    id,
    text,
    type,
    status = `IN_PROGRESS`,
    current,
    total,
  }) => {
    const actionsToEmit = []

    if (getStore().getState().logs.status !== `IN_PROGRESS`) {
      actionsToEmit.push(actions.setStatus(`IN_PROGRESS`))
    }

    actionsToEmit.push({
      type: `ACTIVITY_START`,
      payload: {
        id,
        uuid: uuidv4(),
        text,
        type,
        status,
        startTime: process.hrtime(),

        statusText: ``,

        current,
        total,
      },
    })

    return actionsToEmit
  },
  endActivity: ({ id, status }) => {
    const activity = getActivity(id)
    if (!activity) {
      return null
    }
    const actionsToEmit = []
    if (activity.type === `pending`) {
      actionsToEmit.push({
        type: `ACTIVITY_CANCEL`,
        payload: {
          id,
          status: `CANCELLED`,
        },
      })
    } else {
      let duration = 0
      if (activity.status === `IN_PROGRESS`) {
        duration = getElapsedTimeMS(activity)
        trackCli(`ACTIVITY_DURATION`, {
          name: activity.name,
          duration,
        })
      }

      actionsToEmit.push({
        type: `ACTIVITY_END`,
        payload: {
          uuid: activity.uuid,
          id,
          status,
          duration,
        },
      })

      if (activity.type !== `hidden`) {
        actionsToEmit.push(
          actions.createLog({
            text: activity.text,
            level: `ACTIVITY_${status}`,
            duration,
            statusText:
              activity.statusText ||
              (status === `SUCCESS` && activity.type === `progress`
                ? `${activity.current}/${activity.total} ${(
                    activity.total / duration
                  ).toFixed(2)}/s`
                : undefined),
            activity_uuid: activity.uuid,
            activity_current: activity.current,
            activity_total: activity.total,
            activity_type: activity.type,
          })
        )
      }
    }

    const logsState = getStore().getState().logs
    const generatedGlobalStatus = Object.keys(logsState.activities).reduce(
      (generatedStatus, activityId) => {
        const activityStatus =
          activityId === id ? status : logsState.activities[activityId].status

        if (
          activityStatus === `IN_PROGRESS` ||
          activityStatus === `NOT_STARTED`
        ) {
          return `IN_PROGRESS`
        } else if (
          activityStatus === `FAILED` &&
          generatedStatus !== `IN_PROGRESS`
        ) {
          return `FAILED`
        }
        return generatedStatus
      },
      `SUCCESS`
    )

    if (generatedGlobalStatus !== logsState.status) {
      actionsToEmit.push(actions.setStatus(generatedGlobalStatus))
    }

    return actionsToEmit
  },

  updateActivity: ({ id, ...rest }) => {
    const activity = getActivity(id)
    if (!activity) {
      return null
    }

    return {
      type: `ACTIVITY_UPDATE`,
      payload: {
        uuid: activity.uuid,
        id,
        ...rest,
      },
    }
  },
  setActivityStatusText: ({ id, statusText }) =>
    actions.updateActivity({
      id,
      statusText,
    }),
  setActivityTotal: ({ id, total }) =>
    actions.updateActivity({
      id,
      total,
    }),
  activityTick: ({ id, increment = 1 }) => {
    const activity = getActivity(id)
    if (!activity) {
      return null
    }

    return actions.updateActivity({
      id,
      current: activity.current + increment,
    })
  },
}

module.exports = bindActionCreators(actions, dispatch)
