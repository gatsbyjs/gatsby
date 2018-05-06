describe(`highlight code and lines with PrismJS`, () => {
  afterEach(() => {
    jest.resetModules()
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
      highlightCode(language, code, lineNumbersHighlight)
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
    expect(
      highlightCode(language, code, lineNumbersHighlight)
    ).toMatchSnapshot()
  })

  describe(`with language-text`, () => {
    it(`escapes &, <, " elements #4597`, () => {
      const highlightCode = require(`../highlight-code`)
      const language = `text`
      const code = `<button />`
      expect(highlightCode(language, code)).toMatch(`&lt;button /&gt;`)
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
      expect(highlightCode(language, code, linesToHighlight)).not.toMatch(/\n$/)
    })

    it(`a trailing newline is preserved`, () => {
      const highlightCode = require(`../highlight-code`)
      const language = `javascript`
      const linesToHighlight = [1]
      const code = `const a = 1\nconst b = 2\n`
      expect(highlightCode(language, code, linesToHighlight)).toMatch(
        /[^\n]\n$/
      )
    })
  })
})
