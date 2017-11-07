jest.mock(`fs`, () => {
  return {
    existsSync: () => true,
    readFileSync: () => 'const foo = "bar";',
  }
})

const fs = require(`fs`)
const Remark = require(`remark`)
const plugin = require(`../`)

const remark = new Remark()

describe(`gatsby-remark-code-repls`, () => {
  describe('Babel REPL', () => {
    it(`generates a link for the specified example file`, async () => {
      const markdownAST = remark.parse(`[Babel](babel-repl://file.js)`)

      const transformed = plugin({ markdownAST }, { directory: 'example-directory' })

      expect(transformed).toMatchSnapshot()
    })

    it(`generates a link with the specified target`, async () => {
      const markdownAST = remark.parse(`[Babel](babel-repl://file.js)`)

      const transformed = plugin({ markdownAST }, { directory: 'example-directory', target: '_blank' })

      expect(transformed).toMatchSnapshot()
    })

    it(`generates a link for files in nested directories`, async () => {
      const markdownAST = remark.parse(`[Babel](babel-repl://path/to/nested/file.js)`)

      const transformed = plugin({ markdownAST }, { directory: 'example-directory' })

      expect(transformed).toMatchSnapshot()
    })

    it(`errors if provided a link to a local file that does not exist`, async () => {
      fs.existsSync = () => false

      const markdownAST = remark.parse(`[Babel](babel-repl://file.js)`)

      expect(() => {
        plugin({ markdownAST }, {});
      }).toThrow();
    })
  })

  // TODO Test Codepen links and such
})
