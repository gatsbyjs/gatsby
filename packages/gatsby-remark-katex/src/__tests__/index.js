const Remark = require(`remark`)
const plugin = require(`../index`)
const reporter = require(`gatsby-cli/lib/reporter`)

describe(`remark katex plugin`, () => {
  it(`renders inlineMath node properly`, () => {
    const equation = `$a^2 + b^2 = c^2$`
    let remark = new Remark()
    for (let parserPlugins of plugin.setParserPlugins()) {
      remark = remark.use(parserPlugins)
    }
    const markdownAST = remark.parse(equation)
    plugin({ markdownAST })
    expect(markdownAST).toMatchSnapshot()
  })

  it(`renders double $ inlineMath node properly`, () => {
    const equation = `$$a^2 + b^2 = c^2$$`
    let remark = new Remark()
    for (let parserPlugins of plugin.setParserPlugins()) {
      remark = remark.use(parserPlugins)
    }
    const markdownAST = remark.parse(equation)
    plugin({ markdownAST })
    expect(markdownAST).toMatchSnapshot()
  })

  it(`renders math node properly`, () => {
    const equation = `$$\na^2 + b^2 = c^2\n$$`
    let remark = new Remark()
    for (let parserPlugins of plugin.setParserPlugins()) {
      remark = remark.use(parserPlugins)
    }
    const markdownAST = remark.parse(equation)
    plugin({ markdownAST })
    expect(markdownAST).toMatchSnapshot()
  })

  it(`doesn't crash when there's an error in development mode`, () => {
    const equation = `$a^2 + b^2 = c^$`
    let remark = new Remark()

    expect(() => {
      for (let parserPlugins of plugin.setParserPlugins()) {
        remark = remark.use(parserPlugins)
      }
      process.env.gatsby_executing_command = `develop`
      const markdownAST = remark.parse(equation)
      plugin({ markdownAST, reporter })
    }).not.toThrow()
  })

  it(`crashes when there's an error in build mode`, () => {
    const equation = `$a^2 + b^2 = c^$`
    let remark = new Remark()

    expect(() => {
      for (let parserPlugins of plugin.setParserPlugins()) {
        remark = remark.use(parserPlugins)
      }
      process.env.gatsby_executing_command = `build`
      const markdownAST = remark.parse(equation)
      plugin({ markdownAST, reporter })
    }).toThrow()
  })
})
