import {
  IGatsbyState,
  IRemoveStaleJobAction,
  IGatsbyIncompleteJobV2,
  IGatsbyCompleteJobV2,
} from "../redux/types"

import { isJobStale } from "../utils/jobs-manager"
import { internalActions } from "../redux/actions"

export const removeStaleJobs = (
  state: IGatsbyState
): Array<
  | IRemoveStaleJobAction
  | ReturnType<typeof internalActions["createJobV2FromInternalJob"]>
> => {
  const actions: Array<
    | IRemoveStaleJobAction
    | ReturnType<typeof internalActions["createJobV2FromInternalJob"]>
  > = []

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
  state.jobsV2.incomplete.forEach(({ job }: IGatsbyIncompleteJobV2): void => {
    if (isJobStale(job)) {
      actions.push(internalActions.removeStaleJob(job.contentDigest))
    } else {
      actions.push(internalActions.createJobV2FromInternalJob(job))
    }
  })

  return actions
}
