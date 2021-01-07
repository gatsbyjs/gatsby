import React, { Component } from "react"

export default class Dynamic extends Component {
  constructor(props) {
    super(props)
    this.state = { module: null }
  }
  componentDidMount() {
    import(`../components/title`).then(module =>
      this.setState({ module: module.default })
    )
  }
  render() {
    const { module: Component } = this.state
    return <div>{Component && <Component />}</div>
  }
}
