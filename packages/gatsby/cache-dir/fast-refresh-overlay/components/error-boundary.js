import * as React from "react"

export function ErrorBoundary({hasErrors, children}) {
  function componentDidCatch(error) {
    this.setState({ error })
  }

  // Without this check => possible infinite loop
return this.state.error && hasErrors ? null : children;
}
