import React from "react"

import Time from "./time"

export default ({ dateObject }) => {
  return (
    <div>
      <span data-testid="date">{dateObject.toString()}</span>
      <Time dateObject={dateObject} />
    </div>
  )
}
