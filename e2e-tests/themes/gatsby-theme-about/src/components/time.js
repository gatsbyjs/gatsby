import React from "react"

export default ({ date }) => (
  <span data-testid="time">{date.toTimeString()}</span>
)
