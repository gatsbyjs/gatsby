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

    const transformed = plugin({ markdownAST }, {})

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

    const transformed = plugin({ markdownAST }, {})

    visit(transformed, `heading`, node => {
      expect(node.data.id).toBeDefined()
    })
  })
  it(`adds id to a markdown header with custom svg icon`, () => {
    const markdownAST = remark.parse(`# Heading Uno`)
    const icon = `<svg width="400" height="110"><rect width="300" height="100" /></svg>`

    const transformed = plugin({ markdownAST }, { icon })

    visit(transformed, `heading`, node => {
      expect(node.data.id).toBeDefined()

      expect(node).toMatchSnapshot()
    })
  })

  it(`adds ids to each markdown header with custom svg icon`, () => {
    const markdownAST = remark.parse(`
# Heading One

## Heading Two

### Heading Three
    `)
    const icon = `<svg width="400" height="110"><rect width="300" height="100" /></svg>`

    const transformed = plugin({ markdownAST }, { icon })

    visit(transformed, `heading`, node => {
      expect(node.data.id).toBeDefined()
    })
  })
})
