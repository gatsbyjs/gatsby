import constructError from "../construct-error"
import { errorMap } from "../error-map"
import { Level } from "../types"

let log
let processExit
beforeEach(() => {
  log = jest.spyOn(console, `log`).mockImplementation(() => {})
  processExit = ((jest.spyOn(
    process,
    `exit`
  ) as unknown) as jest.Mock).mockImplementation(() => {})

  log.mockReset()
  processExit.mockReset()
})

afterAll(() => {
  ;(console.log as jest.Mock).mockClear()
  ;((process.exit as unknown) as jest.Mock).mockClear()
})

test(`it exits on invalid error schema`, () => {
  constructError({ details: { context: {}, lol: `invalid` } }, errorMap)

  expect(processExit).toHaveBeenCalledWith(1)
})

test(`it logs error on invalid schema`, () => {
  constructError({ details: { context: {}, lol: `invalid` } }, errorMap)

  expect(log).toHaveBeenCalledWith(
    `Failed to validate error`,
    expect.any(Object)
  )
})

test(`it passes through on valid error schema`, () => {
  constructError({ details: { context: {} } }, errorMap)

  expect(log).not.toHaveBeenCalled()
})

test(`it constructs an error from the supplied errorMap`, () => {
  const error = constructError(
    { details: { id: "TEST_ERROR", context: { someProp: `Error!` } } },
    {
      TEST_ERROR: {
        text: (context): string => `Error text is ${context.someProp} `,
        level: Level.ERROR,
        docsUrl: `https://www.gatsbyjs.org/docs/gatsby-cli/#new`
      }
    }
  )

  expect(error.code).toBe(`TEST_ERROR`)
  expect(error.docsUrl).toBe(`https://www.gatsbyjs.org/docs/gatsby-cli/#new`)
})
