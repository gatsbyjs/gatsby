import React from "react"

class ErrorBoundary extends React.Component {
  state = { hasError: false }

  componentDidCatch(error) {
    this.props.onError(error)
  }

  componentDidMount() {
    this.props.clearErrors()
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? null : this.props.children
  }
}

export default ErrorBoundary
