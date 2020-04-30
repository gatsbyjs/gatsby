import {
  IGatsbyState,
  IRemoveStaleJobAction,
  IGatsbyJobV2,
} from "../redux/types"

import { isJobStale } from "../utils/jobs-manager"
import { publicActions, internalActions } from "../redux/actions"

export const removeStaleJobs = (
  state: IGatsbyState
): IRemoveStaleJobAction[] => {
  const actions: IRemoveStaleJobAction[] = []

  // If any of our finished jobs are stale we remove them to keep our cache small
  state.jobsV2.complete.forEach(
    (job: IGatsbyJobV2, contentDigest: string): void => {
      if (isJobStale(job)) {
        actions.push(internalActions.removeStaleJob(contentDigest))
      }
    }
  )

  // If any of our pending jobs do not have an existing inputPath or the inputPath changed
  // we remove it from the queue as they would fail anyway
  state.jobsV2.incomplete.forEach(({ job, plugin }: IGatsbyJobV2): void => {
    if (isJobStale(job)) {
      actions.push(internalActions.removeStaleJob(job.contentDigest))
    } else {
      actions.push(publicActions.createJobV2(job, plugin))
    }
  })

  return actions
}
