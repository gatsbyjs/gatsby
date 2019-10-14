import React from "react"

import Time from "./time"

export default ({ date }) => (
  <div>
    <span data-testid="date">{date.toLocaleString(`en-US`)}</span>
    <Time date={date} />
  </div>
)
