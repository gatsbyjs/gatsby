const remark = require(`remark`)
const plugin = require(`../index`)

describe(`remark prism plugin`, () => {
  it(`generates a <pre> tag with class="language-*" prefix by default`, () => {
    const code = `\`\`\`js\n// Fake\n\`\`\``
    const markdownAST = remark.parse(code)
    plugin({ markdownAST })
    expect(markdownAST).toMatchSnapshot()
  })

  it(`generates a <pre> tag with a custom class prefix if configured`, () => {
    const code = `\`\`\`js\n// Fake\n\`\`\``
    const markdownAST = remark.parse(code)
    plugin({ markdownAST }, { classPrefix: `custom-` })
    expect(markdownAST).toMatchSnapshot()
  })

  it(`generates inline <code> tag with class="language-*" prefix by default`, () => {
    const code = `\`foo bar\``
    const markdownAST = remark.parse(code)
    plugin({ markdownAST })
    expect(markdownAST).toMatchSnapshot()
  })

  it(`generates inline <code> tag with a custom class prefix if configured`, () => {
    const code = `\`foo bar\``
    const markdownAST = remark.parse(code)
    plugin({ markdownAST }, { classPrefix: `custom-` })
    expect(markdownAST).toMatchSnapshot()
  })

  it(`inlineCode handles language specifiers`, () => {
    const code = `\`css›.foo { color: red }\``
    const markdownAST = remark.parse(code)
    plugin({ markdownAST })
    expect(markdownAST).toMatchSnapshot()
  })
})
