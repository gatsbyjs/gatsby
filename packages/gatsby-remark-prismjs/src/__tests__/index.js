const remark = require(`remark`)
const cheerio = require(`cheerio`)
let plugin

describe(`remark prism plugin`, () => {
  beforeEach(() => {
    jest.resetModules()
    plugin = require(`../index`)
  })

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

    it(`with aliases that do not exist`, () => {
      const code = `\`\`\`foobar\n// Fake\n\`\`\``
      const markdownAST = remark.parse(code)
      plugin({ markdownAST }, { aliases: { baz: `javascript` } })
      expect(markdownAST).toMatchSnapshot()
    })

    it(`with highlighted lines`, () => {
      const code = `\`\`\`js{2}\n// 1\n// 2\n// 3\n\`\`\``
      const markdownAST = remark.parse(code)
      plugin({ markdownAST })
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

  it(`does not handle inline code if noInlineHighlight: true`, () => {
    const code = `some text \`containing inline code\``
    const markdownAST = remark.parse(code)
    plugin({ markdownAST }, { noInlineHighlight: true })
    expect(markdownAST).toMatchSnapshot()
  })

  describe(`promptUser/promptHost`, () => {
    it(`adds prompts if promptUser set`, () => {
      const code = `\`\`\`bash{promptUser:alice}\necho 'test'\`\`\``
      const markdownAST = remark.parse(code)
      plugin({ markdownAST })
      expect(markdownAST).toMatchSnapshot()
    })

    it(`adds prompts if promptHost set`, () => {
      const code = `\`\`\`bash{promptHost:server}\necho 'test'\`\`\``
      const markdownAST = remark.parse(code)
      plugin({ markdownAST })
      expect(markdownAST).toMatchSnapshot()
    })

    it(`adds prompts if promptUser and promptHost set`, () => {
      const code = `\`\`\`bash{promptUser:alice}{promptHost:server}\necho 'test'\`\`\``
      const markdownAST = remark.parse(code)
      plugin({ markdownAST })
      expect(markdownAST).toMatchSnapshot()
    })
  })

  describe(`diff`, () => {
    test(`supports language specifier`, () => {
      const code = `\`\`\`diff-javascript
-    let foo = bar.baz([1, 2, 3]);
-    foo = foo + 1;
+    const foo = bar.baz([1, 2, 3]) + 1;
     console.log(foo);
\`\`\``
      const markdownAST = remark.parse(code)
      plugin({ markdownAST })
      expect(markdownAST).toMatchSnapshot()
    })
  })

  describe(`numberLines`, () => {
    it(`adds line-number markup when necessary`, () => {
      const code = `\`\`\`js{numberLines:5}\n//.foo { \ncolor: red;\n }\``
      const markdownAST = remark.parse(code)
      plugin({ markdownAST })
      expect(markdownAST).toMatchSnapshot()
    })

    it(`adds line-number markup when configured globally`, () => {
      const code = `\`\`\`js\n//.foo { \ncolor: red;\n }\``
      const markdownAST = remark.parse(code)
      plugin({ markdownAST }, { showLineNumbers: true })
      expect(markdownAST).toMatchSnapshot()
    })

    it(`correctly counts line-numbers for markup using highlight classes`, () => {
      const code =
        `\`\`\`js\n` +
        `function highlightTest() {\n` +
        `// highlight-start\n` +
        `return "this is a highlight test"\n` +
        `// highlight-end\n` +
        `}\n` +
        `\`\`\``
      const markdownAST = remark.parse(code)
      plugin({ markdownAST }, { showLineNumbers: true })

      const htmlResult = markdownAST.children[0].value
      const $ = cheerio.load(htmlResult)
      const numberOfLineNumbers = $(`.line-numbers-rows > span`).length
      expect(numberOfLineNumbers).toEqual(3)
    })

    it(`does not add line-number markup when not configured globally`, () => {
      const code = `\`\`\`js\n//.foo { \ncolor: red;\n }\``
      const markdownAST = remark.parse(code)
      plugin({ markdownAST })
      expect(markdownAST).toMatchSnapshot()
    })
    it(`should not wrap keywords with <span class="token extensionTokenName"> if no extension given`, () => {
      const code = `\`\`\`c\naRandomTypeKeyword var = 32\n\``
      const markdownAST = remark.parse(code)

      plugin({ markdownAST })

      expect(markdownAST.children).toBeDefined()
      expect(markdownAST.children).toHaveLength(1)

      const htmlResult = markdownAST.children[0].value

      expect(htmlResult).not.toMatch(/<span class="token extended_keywords">/)
    })
    it(`should wrap keywords with <span class="token extensionTokenName"> based on given extension`, () => {
      const code = `\`\`\`c\naRandomTypeKeyword var = 32\n\``
      const markdownAST = remark.parse(code)

      const config = {
        languageExtensions: {
          extend: `c`,
          definition: {
            extended_keywords: /(aRandomTypeKeyword)/,
          },
        },
      }

      plugin({ markdownAST }, config)

      expect(markdownAST.children).toBeDefined()
      expect(markdownAST.children).toHaveLength(1)

      const htmlResult = markdownAST.children[0].value

      expect(htmlResult).toMatch(/<span class="token extended_keywords">/)
    })
  })

  describe(`warnings`, () => {
    it(`warns if the language doesn't exist`, () => {
      jest.spyOn(console, `warn`)
      const code = `\`\`\`notexist\n// Fake\n\`\`\``
      const markdownAST = remark.parse(code)
      plugin({ markdownAST }, { noInlineHighlight: true })
      expect(console.warn).toHaveBeenCalledWith(
        `unable to find prism language 'notexist' for highlighting.`,
        `applying generic code block`
      )
    })
  })
})
