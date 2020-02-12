/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"

const Breakout = ({ children }) => (
  <div
    sx={{
      display: `grid`,
      placeContent: `center`,
      width: `98vw`,
      position: `relative`,
      left: `50%`,
      right: `50%`,
      marginLeft: `-49vw`,
      marginRight: `-49vw`,
    }}
  >
    {children}
  </div>
)

export default Breakout
