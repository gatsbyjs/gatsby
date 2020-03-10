import { emitter, store } from "../../redux"

import { waitUntilAllJobsComplete as waitUntilAllJobsV2Complete } from "../jobs-manager"

export const waitUntilAllJobsComplete = (): Promise<void> => {
  const jobsV1Promise = new Promise(resolve => {
    const onEndJob = (): void => {
      if (store.getState().jobs.active.length === 0) {
        resolve()
        emitter.off(`END_JOB`, onEndJob)
      }
    }

    emitter.on(`END_JOB`, onEndJob)
    onEndJob()
  })

  return Promise.all([
    jobsV1Promise,
    waitUntilAllJobsV2Complete(),
  ]).then(() => {})
}
