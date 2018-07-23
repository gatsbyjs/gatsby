const Remark = require(`remark`)
const visit = require(`unist-util-visit`)

const plugin = require(`../`)

const remark = new Remark().data(`settings`, {
  commonmark: true,
  footnotes: true,
  pedantic: true,
})

describe(`gatsby-remark-normalise-headings`, () => {
  it(`bumps all headings to the next level`, () => {
    const markdownAST = remark.parse(`
# Heading One

Content

## Heading Two

Content

### Heading Three

Content
    `)

    const transformed = plugin({ markdownAST }, {})

    let expectedDepth = 2

    visit(transformed, `heading`, node => {
      expect(node.depth).toBe(expectedDepth)
      expectedDepth++
    })

    expect(transformed).toMatchSnapshot()
  })

  describe(`gatsby-remark-normalise-headings`, () => {
    it(`leaves headings alone when they're already correct`, () => {
      const markdownAST = remark.parse(`
## Heading 2

Content

### Heading 3

Content

#### Heading 3

Content
      `)

      const transformed = plugin({ markdownAST }, {})

      let expectedDepth = 2

      visit(transformed, `heading`, node => {
        expect(node.depth).toBe(expectedDepth)
        expectedDepth++
      })

      expect(transformed).toMatchSnapshot()
    })
  })
})
