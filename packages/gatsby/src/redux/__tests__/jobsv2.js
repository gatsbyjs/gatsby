const jobsManager = require(`../../utils/jobs-manager`)
jest.spyOn(jobsManager, `enqueueJob`)
jest.spyOn(jobsManager, `removeInProgressJob`)
jest.mock(`uuid/v4`, () => () => `1234`)

const jobsReducer = require(`../reducers/jobsv2`)

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
    expect(jobsManager.enqueueJob).toMatchSnapshot()
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
