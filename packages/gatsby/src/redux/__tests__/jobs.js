const { actions } = require(`../actions`)
const jobsReducer = require(`../reducers/jobs`)
const jobsManager = require(`../../utils/jobs-manager`)

Date.now = jest.fn(() => 1482363367071)

describe(`Job actions/reducer`, () => {
  beforeEach(() => {
    jobsManager.jobsInProcess.clear()
  })

  it(`allows creating jobs`, () => {
    expect(actions.createJob({ id: `test job` })).toMatchSnapshot()
  })

  it(`allows completing jobs`, () => {
    let state = jobsReducer(undefined, actions.createJob({ id: `test job` }))
    state = jobsReducer(state, actions.endJob({ id: `test job` }))
    expect(state).toMatchSnapshot()
  })

  it(`allows updating jobs`, () => {
    let state = jobsReducer(undefined, actions.createJob({ id: `test job` }))
    state = jobsReducer(state, actions.setJob({ id: `test job`, progress: 40 }))
    expect(state.active[0].progress).toBeDefined()
  })

  it(`Allows you to set other info on the job`, () => {
    const state = jobsReducer(
      undefined,
      actions.createJob({ id: `test job`, word: `yo` })
    )
    expect(state.active[0].word).toBeDefined()
  })

  it(`throws an error if an ID isn't provided`, done => {
    function runReducer() {
      return jobsReducer(undefined, actions.createJob(`test job`))
    }

    expect(runReducer).toThrowErrorMatchingSnapshot()
    done()
  })

  it(`throws an error if endJob is called for a job that's already ended`, done => {
    function runReducer() {
      let state = jobsReducer(undefined, actions.createJob({ id: `test job` }))
      state = jobsReducer(state, actions.endJob({ id: `test job` }))
      state = jobsReducer(
        state,
        actions.endJob({ id: `test job` }, { name: `test-plugin` })
      )
      return state
    }

    expect(runReducer).toThrowErrorMatchingSnapshot()
    done()
  })
})
