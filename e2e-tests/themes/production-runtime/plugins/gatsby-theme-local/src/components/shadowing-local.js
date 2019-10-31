import React from "react"
import ToBeShadowed from "./to-be-shadowed"

export default () => (
  <>
    <header data-testid="header">
      This is component to test shadowing of local theme
    </header>
    <pre data-testid="pre">
      <ToBeShadowed />
    </pre>
  </>
)
