import React, { Component } from 'react'

class ClassComponent extends Component {
  state = {
    custom: true,
  }

  render() {
    const custom = this.state[`%CUSTOM_STATE%`]
    const props = { 'data-testid': `class-component` }
    if (custom) {
      return <h1 {...props}>Custom Message</h1>
    }
    return <h1 {...props}>I am a %CLASS_COMPONENT%</h1>
  }
}

export default ClassComponent
