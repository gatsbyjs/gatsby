module.exports = (
  state = { active: new Set(), stale: new Map(), done: new Map() },
  action
) => {
  switch (action.type) {
    case `CREATE_JOB_V2`: {
      const { job, plugin } = action.payload

      state.stale.set(job.contentDigest, {
        job,
        plugin,
      })
      state.active.add(job.contentDigest)

      return state
    }

    case `END_JOB_V2`: {
      const { job, result } = action.payload
      state.stale.delete(job.contentDigest)
      state.active.delete(job.contentDigest)
      // inputPaths is used to make sure the job is still necessary
      state.done.set(job.contentDigest, { result, inputPaths: job.inputPaths })

      return state
    }

    case `REMOVE_STALE_JOB_V2`: {
      const { contentDigest } = action.payload
      state.stale.delete(contentDigest)
      state.done.delete(contentDigest)

      return state
    }
  }

  return state
}
