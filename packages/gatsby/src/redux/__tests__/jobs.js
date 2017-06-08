const { actions, boundActions } = require(`../actions`)
const jobsReducer = require(`../reducers/jobs`)

Date.now = jest.fn(() => 1482363367071)

describe(`Job actions/reducer`, () => {
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
    let state = jobsReducer(
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
    }

    expect(runReducer).toThrowErrorMatchingSnapshot()
    done()
  })
})
