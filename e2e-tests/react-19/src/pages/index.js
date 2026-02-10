import React from "react"

function ThrowingComponent({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error("Caught error from component")
  }
  return (
    <div data-testid="throwing-component">Component rendered successfully</div>
  )
}

class TestErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div data-testid="error-boundary-fallback">
          Error boundary caught: {this.state.error.message}
        </div>
      )
    }
    return this.props.children
  }
}

export default function Home() {
  const [count, setCount] = React.useState(0)
  const [shouldThrow, setShouldThrow] = React.useState(false)

  const triggerUncaughtError = () => {
    setTimeout(() => {
      throw new Error("Uncaught error from event handler")
    }, 0)
  }

  return (
    <div>
      <h1>Gatsby + React 19 Test</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)} data-testid="increment">
        Increment
      </button>

      <TestErrorBoundary>
        <ThrowingComponent shouldThrow={shouldThrow} />
      </TestErrorBoundary>

      <button
        onClick={() => setShouldThrow(true)}
        data-testid="trigger-caught-error"
      >
        Trigger Caught Error
      </button>

      <button
        onClick={triggerUncaughtError}
        data-testid="trigger-uncaught-error"
      >
        Trigger Uncaught Error
      </button>
    </div>
  )
}
