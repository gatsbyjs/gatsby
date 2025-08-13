import React from "react"

// Component that throws during render (caught error)
function ThrowingComponent({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error("Caught error from component")
  }
  return (
    <div data-testid="throwing-component">Component rendered successfully</div>
  )
}

// Error boundary to catch errors
class TestErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // This will be caught by React and passed to onCaughtError
    console.log("Error boundary caught error:", error.message)
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
  // Test React 19 features
  const [count, setCount] = React.useState(0)
  const [shouldThrow, setShouldThrow] = React.useState(false)

  const triggerUncaughtError = () => {
    // Trigger an uncaught error (not in render, not caught by error boundary)
    setTimeout(() => {
      throw new Error("Uncaught error from event handler")
    }, 0)
  }

  return (
    <div>
      <h1>Gatsby + React 19 Test</h1>
      <p data-testid="react-version">React Version: {React.version}</p>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)} data-testid="increment">
        Increment
      </button>

      <div data-testid="error-testing-section">
        <h2>Error Callback Testing</h2>

        {/* Test caught errors (through error boundary) */}
        <TestErrorBoundary>
          <ThrowingComponent shouldThrow={shouldThrow} />
        </TestErrorBoundary>

        <button
          onClick={() => setShouldThrow(true)}
          data-testid="trigger-caught-error"
        >
          Trigger Caught Error (Component)
        </button>

        {/* Test uncaught errors */}
        <button
          onClick={triggerUncaughtError}
          data-testid="trigger-uncaught-error"
        >
          Trigger Uncaught Error (Async)
        </button>

        {/* Display error counts and messages for testing */}
        <div data-testid="error-counts">
          <div data-testid="caught-count">
            Caught Errors: <span id="caught-error-count">0</span>
          </div>
          <div data-testid="uncaught-count">
            Uncaught Errors: <span id="uncaught-error-count">0</span>
          </div>
        </div>

        {/* Error display areas */}
        <div
          id="caught-error-display"
          data-testid="caught-error-display"
          style={{ display: "none", color: "red", marginTop: "10px" }}
        >
          No caught errors
        </div>
        <div
          id="uncaught-error-display"
          data-testid="uncaught-error-display"
          style={{ display: "none", color: "red", marginTop: "10px" }}
        >
          No uncaught errors
        </div>
      </div>
    </div>
  )
}
