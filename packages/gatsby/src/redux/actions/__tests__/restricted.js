const { availableActionsByAPI } = require(`../restricted`)

const report = require(`gatsby-cli/lib/reporter`)
report.warn = jest.fn()
report.error = jest.fn()
afterEach(() => {
  report.warn.mockClear()
  report.error.mockClear()
})

const dispatchWithThunk = actionOrThunk =>
  typeof actionOrThunk === `function` ? actionOrThunk() : actionOrThunk

describe(`Restricted actions`, () => {
  it(`handles actions allowed in API`, () => {
    const action = dispatchWithThunk(
      availableActionsByAPI.createSchemaCustomization.createTypes()
    )
    expect(action).toEqual({ type: `CREATE_TYPES` })
    expect(report.warn).not.toHaveBeenCalled()
    expect(report.error).not.toHaveBeenCalled()
  })

  it(`handles actions deprecated in API`, () => {
    let action = dispatchWithThunk(
      availableActionsByAPI.onPreBootstrap.createTypes()
    )
    expect(action).toEqual({ type: `CREATE_TYPES` })
    expect(report.warn).toHaveBeenCalled()
    expect(report.error).not.toHaveBeenCalled()

    action = dispatchWithThunk(availableActionsByAPI.sourceNodes.createTypes())
    expect(action).toEqual({ type: `CREATE_TYPES` })
    expect(report.warn).toHaveBeenCalled()
    expect(report.error).not.toHaveBeenCalled()
  })

  it(`handles actions forbidden in API`, () => {
    const action = dispatchWithThunk(
      availableActionsByAPI.onPostBootstrap.createTypes()
    )
    expect(action).toBeUndefined()
    expect(report.warn).not.toHaveBeenCalled()
    expect(report.error).toHaveBeenCalled()
  })
})
