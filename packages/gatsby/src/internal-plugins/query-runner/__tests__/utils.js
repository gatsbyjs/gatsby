import { indentString, formatErrorDetails } from "../utils"

describe(`Text formatting `, () => {
  it(`indent string correctly`, () => {
    expect(
      indentString(
        `  Line 1
Line 2
  - Line 3`
      )
    ).toMatchSnapshot()
  })

  it(`format error details correctly`, () => {
    const testErrors = new Map()
    testErrors.set(`Field`, `One line error`)
    testErrors.set(
      `Bar`,
      `Three
line
error`
    )
    expect(formatErrorDetails(testErrors)).toMatchSnapshot()
  })
})
