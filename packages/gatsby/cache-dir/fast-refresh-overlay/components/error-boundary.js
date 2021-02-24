import * as React from "react"

export class ErrorBoundary extends React.Component {
  state = { error: null }

  componentDidCatch(error) {
    this.setState({ error })
  }

  render() {
    // Without this check => possible infinite loop
    return this.state.error && this.props.hasErrors ? null : this.props.children
  }
}
