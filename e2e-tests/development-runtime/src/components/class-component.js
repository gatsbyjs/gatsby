import React, { Component } from "react"

function ClassComponent() {
  const custom = this.state[`%CUSTOM_STATE%`]
if (custom) {
return <h1 data-testid="stateful-class-component">Custom Message</h1>
}
return <h1 data-testid="class-component">I am a %CLASS_COMPONENT%</h1>;
}

export default ClassComponent
