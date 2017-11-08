jest.mock(`fs`, () => {return {
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}})

const fs = require(`fs`)
const Remark = require(`remark`)
const plugin = require(`../`)

const REMARK_TESTS = {
  Babel: `babel-repl://`,
  Codepen: `codepen://`,
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

        const transformed = plugin({ markdownAST }, { directory: `example-directory` })

        expect(transformed).toMatchSnapshot()
      })

      it(`generates a link with the specified target`, async () => {
        const markdownAST = remark.parse(`[](${protocol}file.js)`)

        const transformed = plugin({ markdownAST }, { directory: `example-directory`, target: `_blank` })

        expect(transformed).toMatchSnapshot()
      })

      it(`generates a link for files in nested directories`, async () => {
        const markdownAST = remark.parse(`[](${protocol}path/to/nested/file.js)`)

        const transformed = plugin({ markdownAST }, { directory: `example-directory` })

        expect(transformed).toMatchSnapshot()
      })

      it(`generates a link with the specified default text`, () => {
        const markdownAST = remark.parse(`[](${protocol}file.js)`)

        const transformed = plugin({ markdownAST }, { defaultText: `Click me` })

        expect(transformed).toMatchSnapshot()
      })

      it(`generates a link with the specified inline text even if default text is specified`, () => {
        const markdownAST = remark.parse(`[Custom link text](${protocol}file.js)`)

        const transformed = plugin({ markdownAST }, { defaultText: `Click me` })

        expect(transformed).toMatchSnapshot()
      })

      it(`verifies example files relative to the specified directory`, () => {
        const markdownAST = remark.parse(`[](${protocol}path/to/nested/file.js)`)

        plugin({ markdownAST }, { directory: `my-examples` })

        expect(fs.existsSync).toHaveBeenCalledWith(`my-examples/path/to/nested/file.js`)
      })

      it(`errors if provided a link to a local file that does not exist`, async () => {
        fs.existsSync.mockReturnValue(false)

        const markdownAST = remark.parse(`[](${protocol}file.js)`)

        expect(() => plugin({ markdownAST })).toThrow()
      })
    })
  })
})
