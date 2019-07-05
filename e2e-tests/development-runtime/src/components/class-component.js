import React, { Component } from "react"

class ClassComponent extends Component {
  state = {
    custom: true,
  }

  render() {
    const custom = this.state[`%CUSTOM_STATE%`]
    if (custom) {
      return <h1 data-testid="stateful-class-component">Custom Message</h1>
    }
    return <h1 data-testid="class-component">I am a %CLASS_COMPONENT%</h1>
  }
}

export default ClassComponent
