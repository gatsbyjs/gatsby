const remark = require(`remark`)
const plugin = require(`../index`)

describe(`remark prism plugin`, () => {
  describe(`generates a <pre> tag`, () => {
    it(`with class="language-*" prefix by default`, () => {
      const code = `\`\`\`js\n// Fake\n\`\`\``
      const markdownAST = remark.parse(code)
      plugin({ markdownAST })
      expect(markdownAST).toMatchSnapshot()
    })

    it(`with a custom class prefix if configured`, () => {
      const code = `\`\`\`js\n// Fake\n\`\`\``
      const markdownAST = remark.parse(code)
      plugin({ markdownAST }, { classPrefix: `custom-` })
      expect(markdownAST).toMatchSnapshot()
    })

    it(`with aliases applied`, () => {
      const code = `\`\`\`foobar\n// Fake\n\`\`\``
      const markdownAST = remark.parse(code)
      plugin({ markdownAST }, { aliases: { foobar: `javascript` } })
      expect(markdownAST).toMatchSnapshot()
    })
  })

  describe(`generates an inline <code> tag`, () => {
    it(`with class="language-*" prefix by default`, () => {
      const code = `\`foo bar\``
      const markdownAST = remark.parse(code)
      plugin({ markdownAST })
      expect(markdownAST).toMatchSnapshot()
    })

    it(`with a custom class prefix if configured`, () => {
      const code = `\`foo bar\``
      const markdownAST = remark.parse(code)
      plugin({ markdownAST }, { classPrefix: `custom-` })
      expect(markdownAST).toMatchSnapshot()
    })

    it(`that handles language specifiers`, () => {
      const code = `\`css🍺  .foo { color: red }\``
      const markdownAST = remark.parse(code)
      plugin({ markdownAST }, { inlineCodeMarker: `🍺  ` })
      expect(markdownAST).toMatchSnapshot()
    })

    it(`with aliases applied`, () => {
      const code = `\`foobar : Fake\``
      const markdownAST = remark.parse(code)
      plugin(
        { markdownAST },
        { inlineCodeMarker: ` : `, aliases: { foobar: `javascript` } }
      )
      expect(markdownAST).toMatchSnapshot()
    })
  })
})
