import { GatsbyCLI } from "../test-helpers"

const MAX_TIMEOUT = 2147483647
jest.setTimeout(MAX_TIMEOUT)

jest.mock('gatsby-core-utils', () => ({ isCI: () => false }))

describe(`gatsby feedback`, () => {
  it(`Prints a note to give feedback`, () => {
    const [status, logs] = GatsbyCLI.from(`gatsby-sites/gatsby-build`).invoke(
      `feedback`
    )

    logs.should.contain(
      `Hello! Will you help Gatsby improve by taking a four question survey?`
    )
    logs.should.contain(
      `It takes less than five minutes and your ideas and feedback will be very helpful`
    )
    logs.should.contain(
      `Give us your feedback here: https://gatsby.dev/feedback`
    )
    expect(status).toBe(0)
  })
})
