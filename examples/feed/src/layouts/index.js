import React from "react"

export default class DefaultLayout extends React.Component {
  render() {
    return <div>{this.props.children()}</div>
  }
}
