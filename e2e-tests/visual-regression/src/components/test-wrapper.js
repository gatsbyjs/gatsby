import React from "react"
export function TestWrapper({ children, style }) {
  return (
    <div
      id="test-wrapper"
      style={{
        display: "inline-block",
        border: `1px black solid`,
        padding: `5px`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
