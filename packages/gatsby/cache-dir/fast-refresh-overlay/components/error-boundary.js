import * as React from "react"

export class ErrorBoundary extends React.Component {
  state = { error: null }

  componentDidCatch(error) {
    this.props.onError(error)
    this.setState({ error })
  }

  render() {
    return this.state.error ? null : this.props.children
  }
}
