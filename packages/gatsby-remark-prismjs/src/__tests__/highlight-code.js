describe(`highlight code and lines with PrismJS`, () => {
  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it(`for language cpp`, () => {
    const highlightCode = require(`../highlight-code`)
    const language = `cpp`
    const lineNumbersHighlight = [1, 2]
    const code = `
int sum(a, b) {
  return a + b;
}
`
    expect(
      highlightCode(language, code, {}, lineNumbersHighlight)
    ).toMatchSnapshot()
  })

  it(`for language jsx`, () => {
    const highlightCode = require(`../highlight-code`)
    const language = `jsx`
    const lineNumbersHighlight = [12, 13, 15]
    const code = `
import React from "react"

class Counter extends React.Component {
  constructor() {
    super()
    this.state = { count: 0 }
  }

  render() {
    return (
      <div>
        <h1>Counter</h1>
        <p>current count: {this.state.count}</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          plus
        </button>
        <button onClick={() => this.setState({ count: this.state.count - 1 })}>
          minus
        </button>
      </div>
    )
  }
}

export default Counter
`
    const processed = highlightCode(language, code, {}, lineNumbersHighlight)

    expect(processed).toMatchSnapshot()
    // expect spans to not contain \n as it would break line highlighting
    expect(/<span[^>]*>[^<]*\n[^<]*<\/span>/g.exec(processed)).not.toBeTruthy()
  })

  it(`for language diff-typescript`, () => {
    const highlightCode = require(`../highlight-code`)
    const language = `diff`
    const diffLanguage = `typescript`
    const lineNumbersHighlight = []
    const code = `
-    let foo = bar.baz([1, 2, 3]);
-    foo = foo + 1;
+    const foo = bar.baz([1, 2, 3]) + 1;
     console.log(foo);
`

    expect(
      highlightCode(
        language,
        code,
        {},
        lineNumbersHighlight,
        false,
        diffLanguage
      )
    ).toMatchSnapshot()
  })

  describe(`with language-text`, () => {
    it(`escapes &, <, " elements and warns`, () => {
      jest.spyOn(console, `warn`)

      const highlightCode = require(`../highlight-code`)
      const language = `text`
      const code = `<button />`
      expect(highlightCode(language, code, {}, [], true)).toMatch(
        `&lt;button />`
      )
    })

    it(`can warn about languages missing from inline code`, () => {
      jest.spyOn(console, `warn`)

      const highlightCode = require(`../highlight-code`)
      const language = `text`
      const code = `<button />`
      expect(highlightCode(language, code)).toMatch(`&lt;button />`)
    })

    it(`warns once per language`, () => {
      jest.spyOn(console, `warn`)

      const highlightCode = require(`../highlight-code`)
      const language1 = `text`
      const language2 = `raw`
      const code1 = `<button />`
      const code2 = `<form />`
      const code3 = `<input />`
      highlightCode(language1, code1)
      highlightCode(language1, code2)
      highlightCode(language2, code3)
      expect(console.warn).toHaveBeenCalledTimes(1)
      expect(console.warn).toHaveBeenNthCalledWith(
        1,
        `unable to find prism language 'raw' for highlighting.`,
        `applying generic code block`
      )
    })
  })

  describe(`with language-none`, () => {
    it(`does not escape its contents`, () => {
      const highlightCode = require(`../highlight-code`)
      const language = `none`
      const code = `<guineapig />`
      expect(highlightCode(language, code)).toMatch(code)
    })
  })

  describe(`with non-highlight-lines`, () => {
    it(`does not add trailing newlines`, () => {
      const highlightCode = require(`../highlight-code`)
      const language = `javascript`
      const code = `const a = 1\nconst b = 2`
      expect(highlightCode(language, code)).not.toMatch(/\n$/)
    })

    it(`a trailing newline is preserved`, () => {
      const highlightCode = require(`../highlight-code`)
      const language = `javascript`
      const code = `const a = 1\nconst b = 2\n`
      expect(highlightCode(language, code)).toMatch(/[^\n]\n$/)
    })
  })

  describe(`with non-highlight-lines`, () => {
    it(`does not add trailing newlines`, () => {
      const highlightCode = require(`../highlight-code`)
      const language = `javascript`
      const linesToHighlight = [1]
      const code = `const a = 1\nconst b = 2`
      expect(highlightCode(language, code, {}, linesToHighlight)).not.toMatch(
        /\n$/
      )
    })

    it(`a trailing newline is preserved`, () => {
      const highlightCode = require(`../highlight-code`)
      const language = `javascript`
      const linesToHighlight = [1]
      const code = `const a = 1\nconst b = 2\n`
      expect(highlightCode(language, code, {}, linesToHighlight)).toMatch(
        /[^\n]\n$/
      )
    })
  })
})
