const { truncatePath } = require(`../public`)

const report = require(`gatsby-cli/lib/reporter`)
report.warn = jest.fn()
report.error = jest.fn()
afterEach(() => {
  report.warn.mockClear()
  report.error.mockClear()
})

const VERY_LONG_PATH = `/` + `hello-world-`.repeat(100) + `/post`
const SHORT_PATH = `/hello-world`

describe(`Public actions`, () => {
  it(`Truncates long paths correctly`, () => {
    const truncatedPath = truncatePath(VERY_LONG_PATH)
    for (const part of truncatedPath) {
      expect(part.length).toBeLessThanOrEqual(255)
    }
    expect(report.warn).not.toHaveBeenCalled()
    expect(report.error).not.toHaveBeenCalled()
  })

  it(`Does not truncate short paths`, () => {
    const truncatedPath = truncatePath(SHORT_PATH)
    expect(truncatedPath).toEqual(`hello-world`)
    expect(report.warn).not.toHaveBeenCalled()
    expect(report.error).not.toHaveBeenCalled()
  })
})
