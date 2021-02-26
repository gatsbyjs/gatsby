import { actions } from "../actions"
import { jobsReducer } from "../reducers/jobs"
import { IGatsbyState } from "../types"
import reporter from "gatsby-cli/lib/reporter"

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    warn: jest.fn(),
  }
})

beforeEach(() => {
  ;(reporter as any).warn.mockClear()
})

Date.now = jest.fn(() => 1482363367071)

describe(`Job actions/reducer`, () => {
  it(`displays deprecation warning for createJob`, () => {
    actions.createJob({ id: `test job` })
    actions.createJob({ id: `test job` }, { name: `gatsby-plugin-foo` })
    expect(reporter.warn).toHaveBeenCalledTimes(2)
    expect(reporter.warn).toHaveBeenCalledWith(
      `Action "createJob" is deprecated. Please use "createJobV2" instead`
    )
    expect(reporter.warn).toHaveBeenCalledWith(
      `Action "createJob" is deprecated. Please use "createJobV2" instead (called by gatsby-plugin-foo)`
    )
  })

  it(`displays deprecation warning for endJob`, () => {
    actions.endJob({ id: `test job` })
    actions.endJob({ id: `test job` }, { name: `gatsby-plugin-foo` })
    expect(reporter.warn).toHaveBeenCalledTimes(2)
    expect(reporter.warn).toHaveBeenCalledWith(
      `Action "endJob" is deprecated. Please use "createJobV2" instead`
    )
    expect(reporter.warn).toHaveBeenCalledWith(
      `Action "endJob" is deprecated. Please use "createJobV2" instead (called by gatsby-plugin-foo)`
    )
  })

  it(`displays deprecation warning for setJob`, () => {
    actions.setJob({ id: `test job`, progress: 40 })
    actions.setJob(
      { id: `test job`, progress: 40 },
      { name: `gatsby-plugin-foo` }
    )
    expect(reporter.warn).toHaveBeenCalledTimes(2)
    expect(reporter.warn).toHaveBeenCalledWith(
      `Action "setJob" is deprecated. Please use "createJobV2" instead`
    )
    expect(reporter.warn).toHaveBeenCalledWith(
      `Action "setJob" is deprecated. Please use "createJobV2" instead (called by gatsby-plugin-foo)`
    )
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
    function runReducer(): void {
      jobsReducer(undefined, actions.createJob(`test job`))
    }

    expect(runReducer).toThrowErrorMatchingSnapshot()
    done()
  })

  it(`throws an error if endJob is called for a job that's already ended`, done => {
    function runReducer(): IGatsbyState["jobs"] {
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
