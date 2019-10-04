jest.mock(`stack-trace`, () => {
  const trace = jest.requireActual(`stack-trace`)
  return {
    ...trace,
    get: jest.fn(),
  }
})
jest.mock(`fs-extra`, () => {
  const fs = jest.requireActual(`fs-extra`)
  return {
    ...fs,
    readFileSync: jest.fn(),
  }
})
const trace = require(`stack-trace`)
const fs = require(`fs-extra`)
const path = require(`path`)
const { getNonGatsbyCodeFrameFormatted } = require(`../stack-trace-utils`)

beforeEach(() => {
  trace.get.mockClear()
  fs.readFileSync.mockClear()
})

const setup = ({ columnNumber, fileName, lineNumber }, code = ``) => {
  const stack = {
    getFileName: jest.fn(() => fileName),
    getLineNumber: jest.fn(() => lineNumber),
    getColumnNumber: jest.fn(() => columnNumber),
  }

  trace.get.mockReturnValueOnce([stack])
  fs.readFileSync.mockReturnValueOnce(code)

  return getNonGatsbyCodeFrameFormatted({ highlightCode: false })
}

describe(`ignores gatsby stack traces`, () => {
  it(`returns null if gatsby code path`, () => {
    expect(
      setup({ fileName: path.dirname(require.resolve(`gatsby/package.json`)) })
    ).toBe(null)
  })
})

describe(`formatting of error messages`, () => {
  it(`invokes readFileSync with fileName`, () => {
    const fileName = `gatsby-node.js`

    setup({ fileName })

    expect(fs.readFileSync).toHaveBeenCalledWith(fileName, expect.any(Object))
  })

  it(`displays lineNumber, columnNumber, and fileName`, () => {
    const fileName = `gatsby-node.js`
    const lineNumber = 0
    const columnNumber = 5
    const code = `exports.createPages = {}`
    const err = setup({ fileName, lineNumber, columnNumber }, code)

    expect(err).toContain([fileName, lineNumber, columnNumber].join(`:`))
  })

  it(`displays code snippet`, () => {
    const fileName = `gatsby-node.js`
    const lineNumber = 0
    const columnNumber = 5
    const code = `exports.createPages = {}`
    const err = setup({ fileName, lineNumber, columnNumber }, code)

    expect(err).toContain(code)
  })
})
