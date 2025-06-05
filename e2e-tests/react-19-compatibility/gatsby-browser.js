// Test React 19 error callbacks by updating DOM elements
export const onCaughtError = ({ error, errorInfo }) => {
  console.log("[Test] onCaughtError callback called!", error?.message || error)

  // Update DOM to show caught error
  if (typeof document !== "undefined") {
    console.log("[Test] Updating DOM for caught error")
    const errorDisplay = document.getElementById("caught-error-display")
    if (errorDisplay) {
      errorDisplay.textContent = `Caught Error: ${error?.message || error}`
      errorDisplay.style.display = "block"
      console.log("[Test] Updated caught error display")
    } else {
      console.log("[Test] Could not find caught-error-display element")
    }

    // Increment counter
    const counter = document.getElementById("caught-error-count")
    if (counter) {
      const currentCount = parseInt(counter.textContent) || 0
      counter.textContent = (currentCount + 1).toString()
      console.log("[Test] Updated caught error counter to:", currentCount + 1)
    } else {
      console.log("[Test] Could not find caught-error-count element")
    }
  }
}

export const onUncaughtError = ({ error, errorInfo }) => {
  console.log(
    "[Test] onUncaughtError callback called!",
    error?.message || error
  )

  // Update DOM to show uncaught error
  if (typeof document !== "undefined") {
    console.log("[Test] Updating DOM for uncaught error")
    const errorDisplay = document.getElementById("uncaught-error-display")
    if (errorDisplay) {
      errorDisplay.textContent = `Uncaught Error: ${error?.message || error}`
      errorDisplay.style.display = "block"
      console.log("[Test] Updated uncaught error display")
    } else {
      console.log("[Test] Could not find uncaught-error-display element")
    }

    // Increment counter
    const counter = document.getElementById("uncaught-error-count")
    if (counter) {
      const currentCount = parseInt(counter.textContent) || 0
      counter.textContent = (currentCount + 1).toString()
      console.log("[Test] Updated uncaught error counter to:", currentCount + 1)
    } else {
      console.log("[Test] Could not find uncaught-error-count element")
    }
  }
}

export const onClientEntry = () => {
  console.log("[Test] onClientEntry called")
  // Try to access React to check version
  try {
    const React = require("react")
    console.log("[Test] React version from require:", React.version)
  } catch (e) {
    console.log("[Test] Could not require React:", e)
  }
}

// Debug: Log when this file is loaded
console.log("[Test] gatsby-browser.js loaded, React version check...")
if (typeof window !== "undefined" && window.React) {
  console.log("[Test] React version:", window.React.version)
} else {
  console.log("[Test] React not available on window")
}
