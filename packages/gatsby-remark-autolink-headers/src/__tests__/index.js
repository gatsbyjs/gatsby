const Remark = require(`remark`)
const visit = require(`unist-util-visit`)

const plugin = require(`../`)

const remark = new Remark().data(`settings`, {
  commonmark: true,
  footnotes: true,
  pedantic: true,
})

describe(`gatsby-remark-autolink-headers`, () => {
  it(`adds id to a markdown header`, () => {
    const markdownAST = remark.parse(`# Heading Uno`)

    const transformed = plugin({ markdownAST })

    visit(transformed, `heading`, node => {
      expect(node.data.id).toBeDefined()

      expect(node).toMatchSnapshot()
    })
  })

  it(`adds ids to each markdown header`, () => {
    const markdownAST = remark.parse(`
# Heading One

## Heading Two

### Heading Three
    `)

    const transformed = plugin({ markdownAST })

    visit(transformed, `heading`, node => {
      expect(node.data.id).toBeDefined()
    })
  })
})
