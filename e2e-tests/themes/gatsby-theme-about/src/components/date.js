import React from "react"

import Time from "./time"

export default ({ dateObject }) => (
  <div>
    <span data-testid="date">{dateObject.toString()}</span>
    <Time dateObject={dateObject} />
  </div>
)
