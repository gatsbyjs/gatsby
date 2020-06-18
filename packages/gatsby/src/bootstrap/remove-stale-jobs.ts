import {
  IGatsbyState,
  IRemoveStaleJobAction,
  IGatsbyIncompleteJobV2,
  IGatsbyCompleteJobV2,
} from "../redux/types"

import { isJobStale } from "../utils/jobs-manager"
import { publicActions, internalActions } from "../redux/actions"

const createJobV2 = publicActions.createJobV2

export const removeStaleJobs = (
  state: IGatsbyState
): (IRemoveStaleJobAction | ReturnType<typeof createJobV2>)[] => {
  const actions: (IRemoveStaleJobAction | ReturnType<typeof createJobV2>)[] = []

  // If any of our finished jobs are stale we remove them to keep our cache small
  state.jobsV2.complete.forEach(
    (job: IGatsbyCompleteJobV2, contentDigest: string): void => {
      if (isJobStale(job)) {
        actions.push(internalActions.removeStaleJob(contentDigest))
      }
    }
  )

  // If any of our pending jobs do not have an existing inputPath or the inputPath changed
  // we remove it from the queue as they would fail anyway
  state.jobsV2.incomplete.forEach(
    ({ job, plugin }: IGatsbyIncompleteJobV2): void => {
      if (isJobStale(job)) {
        actions.push(internalActions.removeStaleJob(job.contentDigest))
      } else {
        actions.push(createJobV2(job, plugin))
      }
    }
  )

  return actions
}
