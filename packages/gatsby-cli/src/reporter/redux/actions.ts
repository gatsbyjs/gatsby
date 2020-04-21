import { bindActionCreators } from "redux"
import { Dispatch } from "redux"
import { dispatch } from "./"
import {
  createLog as internalCreateLog,
  createPendingActivity as internalCreatePendingActivity,
  setStatus as internalSetStatus,
  startActivity as internalStartActivity,
  endActivity as internalEndActivity,
  updateActivity as internalUpdateActivity,
  setActivityErrored as internalSetActivityErrored,
  setActivityStatusText as internalSetActivityStatusText,
  setActivityTotal as internalSetActivityTotal,
  activityTick as internalActivityTick,
} from "./internal-actions"

const actions = {
  createLog: internalCreateLog,
  createPendingActivity: internalCreatePendingActivity,
  setStatus: internalSetStatus,
  startActivity: internalStartActivity,
  endActivity: internalEndActivity,
  updateActivity: internalUpdateActivity,
  setActivityErrored: internalSetActivityErrored,
  setActivityStatusText: internalSetActivityStatusText,
  setActivityTotal: internalSetActivityTotal,
  activityTick: internalActivityTick,
}

const boundActions = bindActionCreators<typeof actions, any>(
  actions,
  (dispatch as any) as Dispatch
)

export const createLog = boundActions.createLog as typeof internalCreateLog
export const createPendingActivity = boundActions.createPendingActivity as typeof internalCreatePendingActivity
export const setStatus = boundActions.setStatus as typeof internalSetStatus
export const startActivity = boundActions.startActivity as typeof internalStartActivity
export const endActivity = boundActions.endActivity as typeof internalEndActivity
export const updateActivity = boundActions.updateActivity as typeof internalUpdateActivity
export const setActivityErrored = boundActions.setActivityErrored as typeof internalSetActivityErrored
export const setActivityStatusText = boundActions.setActivityStatusText as typeof internalSetActivityStatusText
export const setActivityTotal = boundActions.setActivityTotal as typeof internalSetActivityTotal
export const activityTick = boundActions.activityTick as typeof internalActivityTick
