import { emitter, store } from "../redux"

import {
  waitJobs as waitJobsV2,
  waitUntilAllJobsComplete as waitUntilAllJobsV2Complete,
} from "./jobs/manager"

async function waitJobsV1(): Promise<void> {
  return new Promise<void>(resolve => {
    const onEndJob = (): void => {
      if (store.getState().jobs.active.length === 0) {
        resolve()
        emitter.off(`END_JOB`, onEndJob)
      }
    }

    emitter.on(`END_JOB`, onEndJob)
    onEndJob()
  })
}

export const waitUntilAllJobsComplete = (): Promise<void> =>
  Promise.all([waitJobsV1(), waitUntilAllJobsV2Complete()]).then()

export async function waitJobsByRequest(requestId: string): Promise<void> {
  const jobs = store.getState().jobsV2
  const jobDigests = new Set([
    ...(jobs.jobsByRequest.get(requestId) ?? []),
    ...(jobs.jobsByRequest.get(``) ?? []), // wait for jobs without requestId just in case
  ])
  await Promise.all([waitJobsV1(), waitJobsV2(jobDigests)])
}
