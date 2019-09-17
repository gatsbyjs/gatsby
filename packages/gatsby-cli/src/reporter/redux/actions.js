// @flow
const uuidv4 = require(`uuid/v4`)
const convertHrtime = require(`convert-hrtime`)
const { trackCli } = require(`gatsby-telemetry`)
const { bindActionCreators } = require(`redux`)
const { dispatch, getStore } = require(`./index`)
const {
  Actions,
  ActivityLogLevels,
  ActivityStatuses,
  ActivityTypes,
} = require(`../constants`)
const signalExit = require(`signal-exit`)

const getActivity = id => getStore().getState().logs.activities[id]

const getElapsedTimeMS = activity => {
  const elapsed = process.hrtime(activity.startTime)
  return convertHrtime(elapsed)[`seconds`].toFixed(3)
}

const ActivityStatusToLogLevel = {
  [ActivityStatuses.Interrupted]: ActivityLogLevels.Interrupted,
  [ActivityStatuses.Failed]: ActivityLogLevels.Failed,
  [ActivityStatuses.Success]: ActivityLogLevels.Success,
}

const getGlobalStatus = (id, status) => {
  const { logs } = getStore().getState()

  const currentActivities = [id, ...Object.keys(logs.activities)]

  return currentActivities.reduce((generatedStatus, activityId) => {
    const activityStatus =
      activityId === id ? status : logs.activities[activityId].status

    if (
      activityStatus === ActivityStatuses.InProgress ||
      activityStatus === ActivityStatuses.NotStarted
    ) {
      return ActivityStatuses.InProgress
    } else if (
      activityStatus === ActivityStatuses.Failed &&
      generatedStatus !== ActivityStatuses.InProgress
    ) {
      return ActivityStatuses.Failed
    }
    return generatedStatus
  }, ActivityStatuses.Success)
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
      type: Actions.SetStatus,
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
    stack,
  }) => {
    return {
      type: Actions.Log,
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
        stack,
      },
    }
  },
  createPendingActivity: ({ id, status = ActivityStatuses.NotStarted }) => {
    const actionsToEmit = []

    const logsState = getStore().getState().logs

    const globalStatus = getGlobalStatus(id, status)

    if (globalStatus !== logsState.status) {
      actionsToEmit.push(actions.setStatus(globalStatus))
    }

    actionsToEmit.push({
      type: Actions.PendingActivity,
      payload: {
        id,
        type: ActivityTypes.Pending,
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
    status = ActivityStatuses.InProgress,
    current,
    total,
  }) => {
    const actionsToEmit = []

    const logsState = getStore().getState().logs

    const globalStatus = getGlobalStatus(id, status)

    if (globalStatus !== logsState.status) {
      actionsToEmit.push(actions.setStatus(globalStatus))
    }

    actionsToEmit.push({
      type: Actions.StartActivity,
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
    if (activity.type === ActivityTypes.Pending) {
      actionsToEmit.push({
        type: Actions.CancelActivity,
        payload: {
          id,
          status: ActivityStatuses.Cancelled,
          type: activity.type,
        },
      })
    } else {
      let duration = 0
      if (activity.status === ActivityStatuses.InProgress) {
        duration = getElapsedTimeMS(activity)
        trackCli(`ACTIVITY_DURATION`, {
          name: activity.text,
          duration,
        })
      }

      actionsToEmit.push({
        type: Actions.EndActivity,
        payload: {
          uuid: activity.uuid,
          id,
          status,
          duration,
          type: activity.type,
        },
      })

      if (activity.type !== ActivityTypes.Hidden) {
        actionsToEmit.push(
          actions.createLog({
            text: activity.text,
            level: ActivityStatusToLogLevel[status],
            duration,
            statusText:
              activity.statusText ||
              (status === ActivityStatuses.Success &&
              activity.type === ActivityTypes.Progress
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

    const globalStatus = getGlobalStatus(id, status)

    if (globalStatus !== logsState.status) {
      actionsToEmit.push(actions.setStatus(globalStatus))
    }

    return actionsToEmit
  },

  updateActivity: ({ id, ...rest }) => {
    const activity = getActivity(id)
    if (!activity) {
      return null
    }

    return {
      type: Actions.UpdateActivity,
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
