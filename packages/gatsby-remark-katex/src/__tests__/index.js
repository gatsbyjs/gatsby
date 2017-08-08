const Remark = require(`remark`)
const plugin = require(`../index`)

describe(`remark katex plugin`, () => {
  it(`renders inlineMath node properly`, () => {
    const equation = `$a^2 + b^2 = c^2$`
    let remark = new Remark()
    for (let parserPlugins of plugin.setParserPlugins()) {
      remark = remark.use(parserPlugins)
    }
    const markdownAST  = remark.parse(equation)
    plugin({ markdownAST })
    expect(markdownAST).toMatchSnapshot()
  })

  it(`renders math node properly`, () => {
    const equation = `$$a^2 + b^2 = c^2$$`
    let remark = new Remark()
    for (let parserPlugins of plugin.setParserPlugins()) {
      remark = remark.use(parserPlugins)
    }
    const markdownAST  = remark.parse(equation)
    plugin({ markdownAST })
    expect(markdownAST).toMatchSnapshot()
  })
})
