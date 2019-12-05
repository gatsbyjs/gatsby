const fs = require(`fs-extra`)
const path = require(`path`)
const { createFileHash } = require(`../utils/jobs-manager`)
const { internalActions } = require(`../redux/actions`)

const checkInputPathsStillExists = job => {
  const fileNotExists = job.inputPaths.some(inputPath => {
    const fullPath = path.join(process.cwd(), inputPath.path)
    if (!fs.existsSync(fullPath)) {
      return true
    }

    const fileHash = createFileHash(fullPath)
    return fileHash !== inputPath.contentDigest
  })

  return !fileNotExists
}

module.exports = state => {
  const actions = []

  // check for finished jobs which inputPaths do not exist anymore.
  // we cleanup our cache
  state.jobsV2.done.forEach((job, contentDigest) => {
    if (!checkInputPathsStillExists(job)) {
      actions.push(internalActions.removStaleJob(contentDigest))
    }
  })

  // We check our stale cache for jobs that do not have the correct inputPaths anymore
  // these jobs should be rescheduled by a gatsby plugin and not by us as the inputs have changed
  state.jobsV2.stale.forEach(({ job, plugin }) => {
    if (checkInputPathsStillExists(job)) {
      actions.push(internalActions.enqueueJob(job, plugin))
    } else {
      actions.push(internalActions.removStaleJob(job))
    }
  })

  return actions
}
