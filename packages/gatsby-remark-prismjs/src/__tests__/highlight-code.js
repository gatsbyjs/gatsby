const parseLineNumberRange = require(`../parse-line-number-range`)
const highlightCode = require(`../highlight-code`)

describe(`highlight code and lines with PrismJS`, () => {
  it(`parses numeric ranges from the languages variable`, () => {
    expect(parseLineNumberRange(`jsx{1,5,7-8}`).highlightLines).toEqual([
      1,
      5,
      7,
      8,
    ])
    expect(parseLineNumberRange(`javascript{7-8}`).highlightLines).toEqual([
      7,
      8,
    ])
    expect(parseLineNumberRange(`javascript{7..8}`).highlightLines).toEqual([
      7,
      8,
    ])
    expect(parseLineNumberRange(`javascript{2}`).highlightLines).toEqual([2])
    expect(parseLineNumberRange(`javascript{2,4-5}`).highlightLines).toEqual([
      2,
      4,
      5,
    ])
  })
  it(`ignores negative numbers`, () => {
    expect(parseLineNumberRange(`jsx{-1,1,5,7-8}`).highlightLines).toEqual([
      1,
      5,
      7,
      8,
    ])
    expect(parseLineNumberRange(`jsx{-1..4}`).highlightLines).toEqual([
      1,
      2,
      3,
      4,
    ])
  })
  it(`handles bad inputs`, () => {
    expect(parseLineNumberRange(`jsx{-1`).highlightLines).toEqual([])
    expect(parseLineNumberRange(`jsx{-1....`).highlightLines).toEqual([])
  })
  it(`parses languages without ranges`, () => {
    expect(parseLineNumberRange(`jsx`).splitLanguage).toEqual(`jsx`)
  })

  it(`highlights code`, () => {
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
