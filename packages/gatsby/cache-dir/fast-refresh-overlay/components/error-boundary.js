import React from "react"

class ErrorBoundary extends React.PureComponent {
  state = { error: null }

  componentDidCatch(error, errorInfo) {
    this.props.onError(error)
    this.setState({ error })
  }

  render() {
    return this.state.error
      ? // The component has to be unmounted or else it would continue to error
        null
      : this.props.children
  }
}

export default ErrorBoundary
