import React from "react"

export default ({ dateObject }) => (
  <span data-testid="time">{dateObject.toLocaleTimeString(`en-US`)}</span>
)
