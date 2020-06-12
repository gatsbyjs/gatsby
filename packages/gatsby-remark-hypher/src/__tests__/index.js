const Remark = require(`remark`)
const visit = require(`unist-util-visit`)

const plugin = require(`../`)

const remark = new Remark().data(`settings`, {
  commonmark: true,
  footnotes: true,
  pedantic: true,
})

describe(`gatsby-remark-hypher`, () => {
  it(`applies hyphenation to text nodes`, () => {
    const markdownAST = remark.parse(`This is a ridiculously long word.`)

    const transformed = plugin({ markdownAST })

    visit(transformed, `text`, node => {
      // transformed text node should contain a soft hyphen
      expect(node.value).toEqual(expect.stringContaining(`­`))
      expect(node.value).toMatchSnapshot()
    })
  })
  it(`does not apply hyphenation to non text nodes`, () => {
    const markdownAST = remark.parse(`This is a \`ridiculously\` long word.`)

    const transformed = plugin({ markdownAST })

    visit(transformed, `text`, node => {
      // transformed text nodes should not contain any soft hyphens
      expect(node.value).toEqual(expect.not.stringContaining(`­`))
      expect(node.value).toMatchSnapshot()
    })
  })
})
