import { bindActionCreators } from "redux"
import { Dispatch } from "redux"
import { dispatch } from "./"

import * as actions from "./internal-actions"

const boundActions = bindActionCreators<typeof actions, any>(
  actions,
  dispatch as any as Dispatch
)

export const createLog = boundActions.createLog as typeof actions.createLog
export const createPendingActivity =
  boundActions.createPendingActivity as typeof actions.createPendingActivity
export const setStatus = boundActions.setStatus as typeof actions.setStatus
export const startActivity =
  boundActions.startActivity as typeof actions.startActivity
export const endActivity =
  boundActions.endActivity as typeof actions.endActivity
export const updateActivity =
  boundActions.updateActivity as typeof actions.updateActivity
export const setActivityErrored =
  boundActions.setActivityErrored as typeof actions.setActivityErrored
export const setActivityStatusText =
  boundActions.setActivityStatusText as typeof actions.setActivityStatusText
export const setActivityTotal =
  boundActions.setActivityTotal as typeof actions.setActivityTotal
export const activityTick =
  boundActions.activityTick as typeof actions.activityTick
