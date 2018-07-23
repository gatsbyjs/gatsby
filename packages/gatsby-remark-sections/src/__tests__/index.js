const Remark = require(`remark`)
const visit = require(`unist-util-visit`)

const plugin = require(`../`)

const remark = new Remark().data(`settings`, {
  commonmark: true,
  footnotes: true,
  pedantic: true,
})

describe(`gatsby-remark-sections`, () => {
  it(`creates a section per level of markdown header`, () => {
    const markdownAST = remark.parse(`
# Heading One

Content

## Heading One A

Content

## Heading One B

Content

# Heading Two

Content Two

# Heading Three

Content Three
    `)

    const transformed = plugin({ markdownAST }, {})

    let sectionCount = 0

    visit(transformed, `element`, node => {
      if (node.data && node.data.hName && node.data.hName === `section`) {
        sectionCount++
      }
    })

    expect(sectionCount).toBe(3)

    expect(transformed).toMatchSnapshot()
  })
})
