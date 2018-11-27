jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    panicOnBuild: jest.fn(),
  }
})

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

  it(`panics on build if there's an error when parsing maths`, () => {
    const equation = `$a^2 + b^2 = c^$`
    let remark = new Remark()
    for (let parserPlugins of plugin.setParserPlugins()) {
      remark = remark.use(parserPlugins)
    }
    const markdownAST = remark.parse(equation)
    plugin({ markdownAST, reporter })
    expect(reporter.panicOnBuild.mock.calls.length).toBe(1)
  })
})
