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
})
