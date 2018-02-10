const Remark = require(`remark`)
const find = require(`unist-util-find`)
const plugin = require(`../index`)

describe(`gatsby-remark-custom-blocks`, () => {
  let remark

  beforeEach(() => {
    remark = new Remark()
  })

  it(`errors if missing required plugin options`, () => {
    expect(plugin.setParserPlugins).toThrow(`missing required "blocks" option`)
  })

  it(`creates nodes of blocks given in options`, () => {
    const parserPlugins = plugin.setParserPlugins({
      blocks: { someType: `test`, anotherType: `another` },
    })
    const [parser, options] = parserPlugins[0]
    remark.use(parser, options)
    const markdownAST = remark.parse(`
[[someType]]
| content
[[anotherType]]
| content`)
    expect(find(markdownAST, { type: `someTypeCustomBlock` })).toBeTruthy()
    expect(find(markdownAST, { type: `anotherTypeCustomBlock` })).toBeTruthy()
  })
})
