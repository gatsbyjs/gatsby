import React from "react"

export default class ErrorBoundary extends React.Component {
  state = { error: null }

  componentDidCatch(error) {
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
