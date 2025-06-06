import React from "react"

export default function Home() {
  // Test React 19 features
  const [count, setCount] = React.useState(0)

  // Test error boundaries
  const [error, setError] = React.useState(null)

  if (error) {
    // Test error boundaries
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <h1>Gatsby + React 19 Test</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)} data-testid="increment">
        Increment
      </button>
      <button
        onClick={() => setError(new Error("Test error"))}
        data-testid="error-button"
      >
        Trigger Error
      </button>
    </div>
  )
}
