jest.mock(`fs`, () => {return {
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}})

const fs = require(`fs`)
const Remark = require(`remark`)
const plugin = require(`../`)

const remark = new Remark()

describe(`gatsby-remark-code-repls`, () => {
  beforeEach(() => {
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(`const foo = "bar";`)
  })

  describe(`Babel REPL`, () => {
    it(`generates a link for the specified example file`, async () => {
      const markdownAST = remark.parse(`[Babel](babel-repl://file.js)`)

      const transformed = plugin({ markdownAST }, { directory: `example-directory` })

      expect(transformed).toMatchSnapshot()
    })

    it(`generates a link with the specified target`, async () => {
      const markdownAST = remark.parse(`[Babel](babel-repl://file.js)`)

      const transformed = plugin({ markdownAST }, { directory: `example-directory`, target: `_blank` })

      expect(transformed).toMatchSnapshot()
    })

    it(`generates a link for files in nested directories`, async () => {
      const markdownAST = remark.parse(`[Babel](babel-repl://path/to/nested/file.js)`)

      const transformed = plugin({ markdownAST }, { directory: `example-directory` })

      expect(transformed).toMatchSnapshot()
    })

    it(`errors if provided a link to a local file that does not exist`, async () => {
      fs.existsSync.mockReturnValue(false)

      const markdownAST = remark.parse(`[Babel](babel-repl://file.js)`)

      expect(() => plugin({ markdownAST })).toThrow()
    })
  })

  describe(`Codepen`, () => {
    it(`generates a link for the specified example file`, () => {
      const markdownAST = remark.parse(`[Codepen](codepen://file.js)`)

      const transformed = plugin({ markdownAST }, { directory: `example-directory` })

      expect(transformed).toMatchSnapshot()
    })

    it(`generates a link with the specified target`, () => {
      const markdownAST = remark.parse(`[Codepen](codepen://file.js)`)

      const transformed = plugin({ markdownAST }, { directory: `example-directory`, target: `_blank` })

      expect(transformed).toMatchSnapshot()
    })

    it(`generates a link with the specified default text`, () => {
      const markdownAST = remark.parse(`[](codepen://file.js)`)

      const transformed = plugin({ markdownAST }, { defaultText: `Click me` })

      expect(transformed).toMatchSnapshot()
    })

    it(`generates a link with the specified inline text even if default text is specified`, () => {
      const markdownAST = remark.parse(`[Custom link text](codepen://file.js)`)

      const transformed = plugin({ markdownAST }, { defaultText: `Click me` })

      expect(transformed).toMatchSnapshot()
    })

    it(`generates a link for files in nested directories`, () => {
      const markdownAST = remark.parse(`[Codepen](codepen://path/to/nested/file.js)`)

      const transformed = plugin({ markdownAST }, { directory: `example-directory` })

      expect(transformed).toMatchSnapshot()
    })

    it(`errors if provided a link to a local file that does not exist`, () => {
      fs.existsSync.mockReturnValue(false)

      const markdownAST = remark.parse(`[Codepen](codepen://file.js)`)

      expect(() => plugin({ markdownAST })).toThrow()
    })
  })
})
