jest.mock(`../../utils/jobs/manager`)

import { isJobStale, enqueueJob } from "../../utils/jobs/manager"
import { internalActions } from "../../redux/actions"

jest.spyOn(internalActions, `removeStaleJob`)
jest.spyOn(internalActions, `createJobV2FromInternalJob`)

import { removeStaleJobs } from "../remove-stale-jobs"

describe(`remove-stale-jobs`, () => {
  let state

  beforeEach(() => {
    state = {
      jobsV2: {
        complete: new Map(),
        incomplete: new Map(),
      },
    }
    ;(internalActions.removeStaleJob as jest.Mock).mockClear()
    ;(internalActions.createJobV2FromInternalJob as jest.Mock).mockClear()
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
    expect(internalActions.createJobV2FromInternalJob).not.toHaveBeenCalled()
  })

  it(`should remove stale jobs from pending cache`, () => {
    const data = {
      job: {
        inputPaths: [`/src/myfile.js`],
        contentDigest: `1234`,
        plugin: { name: `test` },
      },
    }

    state.jobsV2.incomplete.set(`1234`, data)

    isJobStale.mockReturnValue(true)

    expect(removeStaleJobs(state)).toMatchSnapshot()
    expect(internalActions.removeStaleJob).toHaveBeenCalledTimes(1)
    expect(internalActions.removeStaleJob).toHaveBeenCalledWith(`1234`)
    expect(internalActions.createJobV2FromInternalJob).not.toHaveBeenCalled()
  })

  it(`should enqueue pending jobs`, () => {
    const data = {
      job: {
        inputPaths: [`/src/myfile.js`],
        contentDigest: `1234`,
        plugin: { name: `test` },
      },
    }

    state.jobsV2.incomplete.set(`1234`, data)

    isJobStale.mockReturnValue(false)
    // `enqueueJob` will be called internally and while mocked it just return a simple job result
    // we need it to return a promise so createJobV2FromInternalJob action creator works correctly
    enqueueJob.mockReturnValue(Promise.resolve({ result: true }))

    const toDispatch = removeStaleJobs(state)
    const dispatchedActions = []
    for (const actionOrThunk of toDispatch) {
      if (typeof actionOrThunk === `function`) {
        actionOrThunk(
          actionToDispatch => {
            dispatchedActions.push(actionToDispatch)
          },
          () => state
        )
      } else {
        dispatchedActions.push(actionOrThunk)
      }
    }

    expect(dispatchedActions).toMatchSnapshot()
    expect(internalActions.removeStaleJob).toHaveBeenCalledTimes(0)
    expect(internalActions.createJobV2FromInternalJob).toHaveBeenCalledTimes(1)
    expect(internalActions.createJobV2FromInternalJob).toHaveBeenCalledWith(
      data.job
    )
  })
})
