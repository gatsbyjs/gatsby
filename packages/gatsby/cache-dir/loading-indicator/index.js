import React from "react"

import emitter from "../emitter"
import { Indicator } from "./indicator"

// no hooks because we support react versions without hooks support
export class LoadingIndicatorEventHandler extends React.Component {
  state = { visible: false }

  show = () => {
    this.setState({ visible: true })
  }

  hide = () => {
    this.setState({ visible: false })
  }

  componentDidMount() {
    emitter.on(`onDelayedLoadPageResources`, this.show)
    emitter.on(`onRouteUpdate`, this.hide)
  }

  componentWillUnmount() {
    emitter.off(`onDelayedLoadPageResources`, this.show)
    emitter.off(`onRouteUpdate`, this.hide)
  }

  render() {
    return <Indicator visible={this.state.visible} />
  }
}
