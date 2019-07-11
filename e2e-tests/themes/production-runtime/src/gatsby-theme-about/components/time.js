import React from "react"

export default ({ dateObject }) => {
  return (
    <span data-testid="time">{dateObject.toLocaleTimeString("en-US")}</span>
  )
}
