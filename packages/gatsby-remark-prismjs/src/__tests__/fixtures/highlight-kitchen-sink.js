import React, { Component } from "react" // highlight-line
export default class Counter extends Component {
  /* highlight-start */
  state = {
    count: 0,
  }
  /* highlight-end */
  updateCount = () => {
    this.setState(state => ({
      // highlight-next-line
      count: state.count + 1,
    }))
  }
  // highlight-range{1-2}
  render() {
    const { count } = this.state
    return (
      // highlight-line
      <div>
        <span>clicked {count}</span>
        {/* highlight-start */}
        <button onClick={this.updateCount}>Click me</button>
        {/* highlight-end */}
      </div>
    )
  }
}
