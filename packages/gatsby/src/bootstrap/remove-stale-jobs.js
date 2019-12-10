const { isJobStale } = require(`../utils/jobs-manager`)
const { publicActions, internalActions } = require(`../redux/actions`)

module.exports = state => {
  const actions = []

  // If any of our finished jobs are stale we remove them to keep our cache small
  state.jobsV2.done.forEach((job, contentDigest) => {
    if (isJobStale(job, state.program.directory)) {
      actions.push(internalActions.removeStaleJob(contentDigest))
    }
  })

  // If any of our pending jobs do not have an existing inputPath or the inputPath changed
  // we remove it from the queue
  state.jobsV2.stale.forEach(({ job, plugin }) => {
    if (isJobStale(job, state.program.directory)) {
      actions.push(internalActions.removeStaleJob(job.contentDigest))
    } else {
      actions.push(publicActions.createJobV2(job, plugin))
    }
  })

  return actions
}
