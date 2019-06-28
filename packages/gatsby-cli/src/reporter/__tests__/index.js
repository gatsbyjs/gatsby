const reporter = require(`../index.js`)
const reporterInstance = require(`../reporters`)

// TODO: report.error now DOES return something. Get rid of this spying mocking stuff

// report.error doesn't return anything, it creates a `structuredError` object and
// calls reporterInstance.error(structuredError)

// Spy on reporterInstance.error and mock its implementation so it
// returns structuredError

// We can then use the returned structuredError for snapshots.
jest
  .spyOn(reporterInstance, `error`)
  .mockImplementation(structuredError => structuredError)

// We don't care about this
reporter.log = jest.fn()

describe(`report.error`, () => {
  beforeEach(() => {
    reporterInstance.error.mockClear()
  })

  it(`handles "String, Error" signature correctly`, () => {
    reporter.error(
      `Error string passed to reporter`,
      new Error(`Message from new Error`)
    )
    const generatedError = reporterInstance.error.mock.calls[0][0]
    expect(generatedError).toMatchSnapshot({
      stack: expect.any(Array),
    })
  })

  it(`handles "Error" signature correctly`, () => {
    reporter.error(new Error(`Message from new Error`))
    const generatedError = reporterInstance.error.mock.calls[0][0]
    expect(generatedError).toMatchSnapshot({
      stack: expect.any(Array),
    })
  })

  it(`handles "Array of Errors" signature correctly`, () => {
    reporter.error([
      new Error(`Message 1 from new Error`),
      new Error(`Message 2 from new Error`),
      new Error(`Message 3 from new Error`),
    ])
    expect(reporterInstance.error).toHaveBeenCalledTimes(3)

    // get final generated object
    const generatedError = reporterInstance.error.mock.calls[2][0]
    expect(generatedError).toMatchSnapshot({
      stack: expect.any(Array),
    })
  })

  it(`handles "structuredError" signature correctly`, () => {
    reporter.error({
      id: `95312`,
    })
    const generatedError = reporterInstance.error.mock.calls[0][0]
    expect(generatedError).toMatchSnapshot({
      stack: expect.any(Array),
    })
  })

  it(`handles "String" signature correctly`, () => {
    reporter.error(`Error created in Jest`)
    const generatedError = reporterInstance.error.mock.calls[0][0]
    expect(generatedError).toMatchSnapshot({
      stack: expect.any(Array),
    })
  })
})
