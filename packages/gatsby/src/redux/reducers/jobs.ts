import { findIndex, merge, get } from "es-toolkit/compat"
import { oneLine } from "common-tags"
import moment from "moment"

import { IGatsbyState, ActionsUnion } from "../types"

export const jobsReducer = (
  state: IGatsbyState["jobs"] = { active: [], done: [] },
  action: ActionsUnion
): IGatsbyState["jobs"] => {
  switch (action.type) {
    case `CREATE_JOB`:
    case `SET_JOB`: {
      if (!action.payload.id) {
        throw new Error(`An ID must be provided when creating or setting job`)
      }
      const index = findIndex(state.active, j => j.id === action.payload.id)
      if (index !== -1) {
        const mergedJob = merge(state.active[index], {
          ...action.payload,
          createdAt: Date.now(),
          plugin: action.plugin,
        })

        state.active[index] = mergedJob
        return state
      } else {
        state.active.push({
          ...action.payload,
          createdAt: Date.now(),
          plugin: action.plugin,
        })
        return state
      }
    }
    case `END_JOB`: {
      if (!action.payload.id) {
        throw new Error(`An ID must be provided when ending a job`)
      }
      const completedAt = Date.now()
      const index = findIndex(state.active, j => j.id === action.payload.id)
      if (index === -1) {
        throw new Error(oneLine`
          The plugin "${get(action, `plugin.name`, `anonymous`)}"
          tried to end a job with the id "${action.payload.id}"
          that either hasn't yet been created or has already been ended`)
      }
      const job = state.active.splice(index, 1)[0]
      state.done.push({
        ...job,
        completedAt,
        runTime: moment(completedAt).diff(moment(job.createdAt)),
      })

      return state
    }
  }

  return state
}
