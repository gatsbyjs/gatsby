jest.mock(`gatsby-cli/lib/reporter`)
jest.mock(`progress`)
const { createProgress } = require(`../utils`)
const reporter = require(`gatsby-cli/lib/reporter`)
const progress = require(`progress`)

describe(`createProgress`, () => {
  const progressBarHasCorrectApi = bar => {
    expect(bar).toHaveProperty(`start`, expect.any(Function))
    expect(bar).toHaveProperty(`tick`, expect.any(Function))
    expect(bar).toHaveProperty(`done`, expect.any(Function))
    expect(bar).toHaveProperty(`total`)
  }

  it(`should use createProgress from gatsby-cli when available`, () => {
    const bar = createProgress(`test`)
    expect(reporter.createProgress).toBeCalled()
    expect(progress).not.toBeCalled()
    progressBarHasCorrectApi(bar)
  })

  it(`should fallback to a local implementation`, () => {
    reporter.createProgress = null
    const bar = createProgress(`test`)
    expect(progress).toHaveBeenCalledTimes(1)
    progressBarHasCorrectApi(bar)
  })
})
