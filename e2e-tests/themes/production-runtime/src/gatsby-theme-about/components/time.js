import React from "react"

export default ({ date }) => (
  <span data-testid="time">{date.toLocaleTimeString(`en-US`)}</span>
)
