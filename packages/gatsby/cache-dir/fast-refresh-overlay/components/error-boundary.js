import * as React from "react"

export class ErrorBoundary extends React.Component {
  componentDidCatch() {}

  render() {
    return this.props.hasErrors ? null : this.props.children
  }
}
