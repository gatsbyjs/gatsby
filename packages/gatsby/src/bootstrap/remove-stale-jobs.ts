import {
  IGatsbyState,
  IRemoveStaleJobV2Action,
  ICreateJobV2FromInternalAction,
} from "../redux/types"

import { isJobStale } from "../utils/jobs-manager"
import { internalActions } from "../redux/actions"

export const removeStaleJobs = (
  jobs: IGatsbyState["jobsV2"]
): Array<IRemoveStaleJobV2Action | ICreateJobV2FromInternalAction> => {
  const actions: Array<
    IRemoveStaleJobV2Action | ICreateJobV2FromInternalAction
  > = []

  // If any of our finished jobs are stale we remove them to keep our cache small
  jobs.complete.forEach((job, contentDigest) => {
    if (isJobStale(job)) {
      actions.push(internalActions.removeStaleJob(contentDigest))
    }
  })

  // If any of our pending jobs do not have an existing inputPath or the inputPath changed
  // we remove it from the queue as they would fail anyway
  jobs.incomplete.forEach(({ job }): void => {
    if (isJobStale(job)) {
      actions.push(internalActions.removeStaleJob(job.contentDigest))
    } else {
      actions.push(internalActions.createJobV2FromInternalJob(job))
    }
  })

  return actions
}
