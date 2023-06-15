import { jobsV2Reducer as jobsReducer } from "../reducers/jobsv2"
import * as jobsManager from "../../utils/jobs/manager"

jest.mock(`gatsby-core-utils`, () => {
  return {
    ...jest.requireActual(`gatsby-core-utils`),
    isCI: () => true,
    uuid: {
      v4: jest.fn(() => `1234`),
    },
  }
})

jest.mock(`../../utils/jobs/manager`, () => {
  const realJobsManager = jest.requireActual(`../../utils/jobs/manager`)

  return {
    ...realJobsManager,
    enqueueJob: jest.fn(realJobsManager.enqueueJob),
    removeInProgressJob: jest.fn(realJobsManager.removeInProgressJob),
  }
})

describe(`Job v2 actions/reducer`, () => {
  const plugin = {
    name: `test-plugin`,
    version: `1.0.0`,
    resolve: `/node_modules/test-plugin`,
  }
  const createGlobalState = defaultState => {
    return {
      program: {
        directory: __dirname,
      },
      jobsV2: jobsReducer(undefined, {}),
      ...defaultState,
    }
  }

  beforeEach(() => {
    jobsManager.enqueueJob.mockClear()
    jobsManager.enqueueJob.mockImplementation(() => Promise.resolve(`myresult`))
  })

  const createDispatcher = globalState => {
    const dispatch = realAction => jobsReducer(getState().jobsV2, realAction)
    const getState = () => globalState

    return action => action(dispatch, getState)
  }

  const getIsolatedActions = () => {
    let allActions
    jest.isolateModules(() => {
      const { actions, internalActions } = require(`../actions`)
      allActions = { actions, internalActions }
    })

    return allActions
  }

  it(`should enqueueJob`, async () => {
    const { actions } = getIsolatedActions()
    const globalState = createGlobalState()
    const dispatch = createDispatcher(globalState)

    const promise = dispatch(
      actions.createJobV2(
        {
          name: `TEST_JOB`,
          inputPaths: [],
          outputDir: `/public/static`,
          args: {},
        },
        plugin
      )
    )

    expect(globalState.jobsV2).toMatchSnapshot()

    expect(globalState.jobsV2.complete.size).toBe(0)
    expect(globalState.jobsV2.incomplete.size).toBe(1)

    await promise

    const values = Array.from(globalState.jobsV2.complete.values())
    expect(globalState.jobsV2.complete.size).toBe(1)
    expect(values[0]).toEqual({
      result: `myresult`,
      inputPaths: [],
    })
    expect(jobsManager.removeInProgressJob).toHaveBeenCalledTimes(1)
    expect(jobsManager.enqueueJob).toHaveBeenCalledWith({
      args: {},
      contentDigest: `aa9932d515707737e953173cd9c77306`,
      id: `1234`,
      inputPaths: [],
      name: `TEST_JOB`,
      outputDir: `/public/static`,
      plugin: {
        isLocal: false,
        name: `test-plugin`,
        resolve: `/node_modules/test-plugin`,
        version: `1.0.0`,
      },
    })
  })

  it(`should return the result when job already ran`, async () => {
    const { actions } = getIsolatedActions()
    const globalState = createGlobalState()
    const dispatch = createDispatcher(globalState)

    const job = {
      name: `TEST_JOB`,
      inputPaths: [],
      outputDir: `/public/static`,
      args: {},
    }

    await expect(dispatch(actions.createJobV2(job, plugin))).resolves.toBe(
      `myresult`
    )
    await expect(dispatch(actions.createJobV2(job, plugin))).resolves.toBe(
      `myresult`
    )
    expect(jobsManager.enqueueJob).toHaveBeenCalledTimes(1)
  })

  it(`should remove a stale job`, async () => {
    const { internalActions } = getIsolatedActions()
    const { jobsV2 } = createGlobalState()
    jobsV2.complete.set(`1234`, {})
    jobsV2.incomplete.set(`12345`, {})

    jobsReducer(jobsV2, internalActions.removeStaleJob(`1234`))
    expect(jobsV2.complete.size).toBe(0)
    expect(jobsV2.incomplete.size).toBe(1)

    jobsReducer(jobsV2, internalActions.removeStaleJob(`12345`))
    expect(jobsV2.complete.size).toBe(0)
    expect(jobsV2.incomplete.size).toBe(0)
  })
})
