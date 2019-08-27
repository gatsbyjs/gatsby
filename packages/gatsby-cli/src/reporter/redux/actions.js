// @flow
const uuidv4 = require(`uuid/v4`)
const convertHrtime = require(`convert-hrtime`)
const { trackCli } = require(`gatsby-telemetry`)

const { bindActionCreators } = require(`redux`)
const { dispatch, getStore } = require(`./index`)

// const LOG_ACTIONS_VERSION = `dev-initial`

const getActivity = id => getStore().getState().logs.activities[id]

const getElapsedTimeMS = activity => {
  const elapsed = process.hrtime(activity.startTime)
  return convertHrtime(elapsed)[`seconds`].toFixed(3)
}

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
  // createStatefulLog: ({
  //   level,
  //   text,
  //   statusText,
  //   duration,
  //   group,
  //   code,
  //   type,
  //   filePath,
  //   location,
  //   docsUrl,
  //   context,
  //   activity_current,
  //   activity_total,
  //   activity_type,
  // }) => {
  //   return {
  //     type: `STATEFUL_LOG`,
  //     payload: {
  //       level,
  //       text,
  //       statusText,
  //       duration,
  //       group,
  //       code,
  //       type,
  //       filePath,
  //       location,
  //       docsUrl,
  //       context,
  //       activity_current,
  //       activity_total,
  //       activity_type,
  //       timestamp: new Date().toJSON(),
  //     },
  //   }
  // },
  clearStatefulLogs: group => {
    return {
      type: `CLEAR_STATEFUL_LOG`,
      payload: group,
    }
  },
  createPendingActivity: (id, status = `NOT_STARTED`) => {
    return {
      type: `ACTIVITY_PENDING`,
      payload: {
        id,
        type: `pending`,
        status,
        dontShowSuccess: true,
      },
    }
  },
  // completeActivity: (id, status) => {
  //   return {
  //     type: `STRUCTURED_ACTIVITY_END`,
  //     payload: {
  //       id,
  //       status,
  //     },
  //   }
  // },
  setStatus: status => {
    return {
      type: `SET_STATUS`,
      payload: status,
    }
  },
  startActivity: ({
    id,
    text,
    dontShowSuccess,
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
        dontShowSuccess,
        status,
        startTime: process.hrtime(),

        statusText: ``,

        // progress specific fields
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

      // const actionsToEmit = []

      actionsToEmit.push({
        type: `ACTIVITY_END`,
        payload: {
          uuid: activity.uuid,
          id,
          status,
          duration,
        },
      })

      if (!activity.dontShowSuccess) {
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
