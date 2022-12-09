import { Level } from "../../structured-errors/types"
import { reporter } from "../reporter"
import * as reporterActions from "../redux/actions"

// TODO: report.error now DOES return something. Get rid of this spying mocking stuff

// report.error doesn't return anything, it creates a `structuredError` object and
// calls reporterInstance.error(structuredError)

// Spy on reporterInstance.error and mock its implementation so it
// returns structuredError

// We can then use the returned structuredError for snapshots.
jest
  .spyOn(reporterActions, `createLog`)
  // @ts-ignore
  .mockImplementation(structuredLog => structuredLog)

// We don't care about this
reporter.log = jest.fn()

const getErrorMessages = (fn: jest.Mock): any =>
  fn.mock.calls
    .map(([firstArg]) => firstArg)
    .filter(structuredMessage => structuredMessage.level === `ERROR`)

describe(`report.error`, () => {
  beforeEach(() => {
    ;(reporterActions.createLog as jest.Mock).mockClear()
  })

  it(`handles "String, Error" signature correctly`, () => {
    reporter.error(
      `Error string passed to reporter`,
      new Error(`Message from new Error`)
    )
    const generatedError = getErrorMessages(
      reporterActions.createLog as jest.Mock
    )[0]

    expect(generatedError).toMatchSnapshot({
      stack: expect.any(Array),
    })
  })

  it(`handles "Error" signature correctly`, () => {
    reporter.error(new Error(`Message from new Error`))
    const generatedError = getErrorMessages(
      reporterActions.createLog as jest.Mock
    )[0]
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

    const generatedErrors = getErrorMessages(
      reporterActions.createLog as jest.Mock
    )

    expect(generatedErrors.length).toEqual(3)

    // get final generated object
    const generatedError = generatedErrors[2]
    expect(generatedError).toMatchSnapshot({
      stack: expect.any(Array),
    })
  })

  it(`handles "structuredError" signature correctly`, () => {
    reporter.error({
      id: `95312`,
      context: {
        undefinedGlobal: `navigator`,
      },
    })
    const generatedError = getErrorMessages(
      reporterActions.createLog as jest.Mock
    )[0]
    expect(generatedError).toMatchSnapshot()
  })

  it(`handles "String" signature correctly`, () => {
    reporter.error(`Error created in Jest`)
    const generatedError = getErrorMessages(
      reporterActions.createLog as jest.Mock
    )[0]
    expect(generatedError).toMatchSnapshot()
  })

  it(`handles "String, Error, pluginName" signature correctly`, () => {
    reporter.error(
      `Error string passed to reporter`,
      new Error(`Message from new Error`),
      `gatsby-plugin-foo-bar`
    )
    const generatedError = getErrorMessages(
      reporterActions.createLog as jest.Mock
    )[0]
    expect(generatedError).toMatchSnapshot()
  })

  it(`sets an error map if setErrorMap is called`, () => {
    reporter.setErrorMap({
      "1337": {
        text: (context): string => `Error text is ${context.someProp}`,
        level: Level.ERROR,
        docsUrl: `https://www.gatsbyjs.com/docs/gatsby-cli/#new`,
      },
    })

    expect(reporter.errorMap[`1337`]).toBeTruthy()
  })

  it(`uses custom error from errorMap`, () => {
    reporter.setErrorMap({
      "1337": {
        text: (context): string => `Error text is ${context.someProp}`,
        level: Level.ERROR,
        docsUrl: `https://www.gatsbyjs.com/docs/gatsby-cli/#new`,
      },
    })

    reporter.error({
      id: `1337`,
      context: {
        someProp: `test123`,
      },
    })
    const generatedError = getErrorMessages(
      reporterActions.createLog as jest.Mock
    )[0]
    expect(generatedError).toMatchSnapshot()
  })

  // This is how it's potentially called from api-runner-node.js
  // It'll prefix the errorMap and then pass the pluginName as third arg
  it(`uses custom error from errorMap with pluginName`, () => {
    reporter.setErrorMap({
      "gatsby-plugin-foo-bar_1337": {
        text: (context): string => `Error text is ${context.someProp}`,
        level: Level.ERROR,
        docsUrl: `https://www.gatsbyjs.com/docs/gatsby-cli/#new`,
      },
    })

    reporter.error(
      {
        id: `1337`,
        context: {
          someProp: `test123`,
        },
      },
      undefined,
      `gatsby-plugin-foo-bar`
    )
    const generatedError = getErrorMessages(
      reporterActions.createLog as jest.Mock
    )[0]
    expect(generatedError).toMatchSnapshot()
  })
})
