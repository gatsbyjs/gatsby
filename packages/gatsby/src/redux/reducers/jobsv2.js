module.exports = (
  state = { incomplete: new Map(), complete: new Map() },
  action
) => {
  switch (action.type) {
    case `CREATE_JOB_V2`: {
      const { job, plugin } = action.payload

      state.incomplete.set(job.contentDigest, {
        job,
        plugin,
      })

      return state
    }

    case `END_JOB_V2`: {
      const { job, result } = action.payload
      state.incomplete.delete(job.contentDigest)
      // inputPaths is used to make sure the job is still necessary
      state.complete.set(job.contentDigest, {
        result,
        inputPaths: job.inputPaths,
      })

      return state
    }

    case `REMOVE_STALE_JOB_V2`: {
      const { contentDigest } = action.payload
      state.incomplete.delete(contentDigest)
      state.complete.delete(contentDigest)

      return state
    }
  }

  return state
}
