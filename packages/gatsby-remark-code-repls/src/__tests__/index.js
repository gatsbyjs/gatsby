jest.mock(`fs`, () => {
  return {
    existsSync: jest.fn(),
    readFileSync: jest.fn(),
  }
})

const fs = require(`fs`)
const Remark = require(`remark`)
const plugin = require(`../index`)

const { PROTOCOL_BABEL, PROTOCOL_CODEPEN } = require(`../constants`)

const REMARK_TESTS = {
  Babel: PROTOCOL_BABEL,
  Codepen: PROTOCOL_CODEPEN,
}

const remark = new Remark()

describe(`gatsby-remark-code-repls`, () => {
  beforeEach(() => {
    fs.existsSync.mockReset()
    fs.existsSync.mockReturnValue(true)

    fs.readFileSync.mockReset()
    fs.readFileSync.mockReturnValue(`const foo = "bar";`)
  })

  Object.keys(REMARK_TESTS).forEach(name => {
    describe(`${name} remark transform`, () => {
      const protocol = REMARK_TESTS[name]

      it(`generates a link for the specified example file`, async () => {
        const markdownAST = remark.parse(`[](${protocol}file.js)`)

        const transformed = plugin({ markdownAST }, { directory: `examples` })

        expect(transformed).toMatchSnapshot()
      })

      it(`generates a link with the specified target`, async () => {
        const markdownAST = remark.parse(`[](${protocol}file.js)`)

        const transformed = plugin(
          { markdownAST },
          { directory: `examples`, target: `_blank` }
        )

        expect(transformed).toMatchSnapshot()
      })

      it(`generates a link for files in nested directories`, async () => {
        const markdownAST = remark.parse(
          `[](${protocol}path/to/nested/file.js)`
        )

        const transformed = plugin({ markdownAST }, { directory: `examples` })

        expect(transformed).toMatchSnapshot()
      })

      it(`generates a link with the specified default text`, () => {
        const markdownAST = remark.parse(`[](${protocol}file.js)`)

        const transformed = plugin(
          { markdownAST },
          { directory: `examples`, defaultText: `Click me` }
        )

        expect(transformed).toMatchSnapshot()
      })

      it(`generates a link with the specified inline text even if default text is specified`, () => {
        const markdownAST = remark.parse(
          `[Custom link text](${protocol}file.js)`
        )

        const transformed = plugin(
          { markdownAST },
          { defaultText: `Click me`, directory: `examples` }
        )

        expect(transformed).toMatchSnapshot()
      })

      it(`verifies example files relative to the specified directory`, () => {
        const markdownAST = remark.parse(
          `[](${protocol}path/to/nested/file.js)`
        )

        plugin({ markdownAST }, { directory: `examples` })

        expect(fs.existsSync).toHaveBeenCalledWith(
          `examples/path/to/nested/file.js`
        )
      })

      it(`errors if you do not provide a directory parameter`, () => {
        const markdownAST = remark.parse(`[](${protocol}file.js)`)

        expect(() => plugin({ markdownAST })).toThrow(
          `Required REPL option "directory" not specified`
        )
      })

      it(`errors if you provide an invalid directory parameter`, () => {
        fs.existsSync.mockReturnValue(false)

        const markdownAST = remark.parse(`[](${protocol}file.js)`)

        expect(() => plugin({ markdownAST }, { directory: `fake` })).toThrow(
          `Invalid REPL directory specified "fake"`
        )
      })

      it(`errors if provided a link to a local file that does not exist`, async () => {
        fs.existsSync.mockImplementation(path => path === `examples`)

        const markdownAST = remark.parse(`[](${protocol}file.js)`)

        expect(() =>
          plugin({ markdownAST }, { directory: `examples` })
        ).toThrow(`Invalid REPL link specified`)
      })
    })
  })
})
