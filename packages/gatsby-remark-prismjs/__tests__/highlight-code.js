describe(`highlight code and lines with PrismJS`, function () {
  afterEach(function () {
    jest.resetModules();
  });
  it(`for language cpp`, function () {
    var highlightCode = require(`../highlight-code`);

    var language = `cpp`;
    var lineNumbersHighlight = [1, 2];
    var code = `
int sum(a, b) {
  return a + b;
}
`;
    expect(highlightCode(language, code, lineNumbersHighlight)).toMatchSnapshot();
  });
  it(`for language jsx`, function () {
    var highlightCode = require(`../highlight-code`);

    var language = `jsx`;
    var lineNumbersHighlight = [12, 13, 15];
    var code = `
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
`;
    expect(highlightCode(language, code, lineNumbersHighlight)).toMatchSnapshot();
  });
});