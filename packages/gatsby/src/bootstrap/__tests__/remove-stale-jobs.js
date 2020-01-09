jest.mock(`../../utils/jobs-manager`)

const { isJobStale } = require(`../../utils/jobs-manager`)
const { internalActions, publicActions } = require(`../../redux/actions`)

jest.spyOn(internalActions, `removeStaleJob`)

const removeStaleJobs = require(`../remove-stale-jobs`)

describe(`remove-stale-jobs`, () => {
  let state

  beforeEach(() => {
    state = {
      jobsV2: {
        complete: new Map(),
        incomplete: new Map(),
      },
    }

    publicActions.createJobV2 = jest.fn()
    internalActions.removeStaleJob.mockClear()
  })

  it(`should remove stale jobs from complete cache`, () => {
    const job = {
      inputPaths: [`/src/myfile.js`],
    }

    state.jobsV2.complete.set(`1234`, job)

    isJobStale.mockReturnValue(true)

    expect(removeStaleJobs(state)).toMatchSnapshot()
    expect(internalActions.removeStaleJob).toHaveBeenCalledTimes(1)
    expect(internalActions.removeStaleJob).toHaveBeenCalledWith(`1234`)
    expect(publicActions.createJobV2).not.toHaveBeenCalled()
  })

  it(`should remove stale jobs from pending cache`, () => {
    const data = {
      job: {
        inputPaths: [`/src/myfile.js`],
        contentDigest: `1234`,
      },
      plugin: {
        name: `test`,
        version: `1.0.0`,
      },
    }

    state.jobsV2.incomplete.set(`1234`, data)

    isJobStale.mockReturnValue(true)

    expect(removeStaleJobs(state)).toMatchSnapshot()
    expect(internalActions.removeStaleJob).toHaveBeenCalledTimes(1)
    expect(internalActions.removeStaleJob).toHaveBeenCalledWith(`1234`)
    expect(publicActions.createJobV2).not.toHaveBeenCalled()
  })

  it(`should enqueue pending jobs`, () => {
    const data = {
      job: {
        inputPaths: [`/src/myfile.js`],
        contentDigest: `1234`,
      },
      plugin: {
        name: `test`,
        version: `1.0.0`,
      },
    }

    state.jobsV2.incomplete.set(`1234`, data)

    isJobStale.mockReturnValue(false)

    expect(removeStaleJobs(state)).toMatchSnapshot()
    expect(internalActions.removeStaleJob).toHaveBeenCalledTimes(0)
    expect(publicActions.createJobV2).toHaveBeenCalledTimes(1)
    expect(publicActions.createJobV2).toHaveBeenCalledWith(
      data.job,
      data.plugin
    )
  })
})
