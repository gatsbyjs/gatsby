import React, { Component } from 'react'

import { observer, inject } from 'mobx-react'

@inject('store')
@observer
class Counter extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <>
        <div>Count: {this.props.store.Count}</div>
        <div>
          <button onClick={() => this.props.store.Increment()}>Add</button>
          <button onClick={() => this.props.store.Decrement()}>Subtract</button>
        </div>
      </>
    )
  }
}
export default Counter
