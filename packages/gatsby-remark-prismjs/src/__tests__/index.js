const remark = require(`remark`)
const plugin = require(`../index`)

describe(`remark prism plugin`, () => {
  it(`generates a <pre> tag with a language class by default`, () => {
    const code = '```js\n// Fake\n```'
    const markdownAST = remark.parse(code)
    plugin({ markdownAST })
    expect(markdownAST).toMatchSnapshot()
  })

  it(`generates a <pre> tag with a data attribute if configured to do so`, () => {
    const code = '```js\n// Fake\n```'
    const markdownAST = remark.parse(code)
    plugin({ markdownAST }, { useDataAttribute: true})
    expect(markdownAST).toMatchSnapshot()
  })
})
