const { availableActionsByAPI } = require(`../restricted`)

import { reporter } from "gatsby-reporter"
reporter.warn = jest.fn()
reporter.error = jest.fn()
afterEach(() => {
  reporter.warn.mockClear()
  reporter.error.mockClear()
})

const dispatchWithThunk = actionOrThunk =>
  typeof actionOrThunk === `function` ? actionOrThunk() : actionOrThunk

describe(`Restricted actions`, () => {
  it(`handles actions allowed in API`, () => {
    const action = dispatchWithThunk(
      availableActionsByAPI.sourceNodes.createTypes()
    )
    expect(action).toEqual({ type: `CREATE_TYPES` })
    expect(reporter.warn).not.toHaveBeenCalled()
    expect(reporter.error).not.toHaveBeenCalled()
  })

  it(`handles actions deprecated in API`, () => {
    const action = dispatchWithThunk(
      availableActionsByAPI.onPreBootstrap.createTypes()
    )
    expect(action).toEqual({ type: `CREATE_TYPES` })
    expect(reporter.warn).toHaveBeenCalled()
    expect(reporter.error).not.toHaveBeenCalled()
  })

  it(`handles actions forbidden in API`, () => {
    const action = dispatchWithThunk(
      availableActionsByAPI.onPostBootstrap.createTypes()
    )
    expect(action).toBeUndefined()
    expect(reporter.warn).not.toHaveBeenCalled()
    expect(reporter.error).toHaveBeenCalled()
  })
})
