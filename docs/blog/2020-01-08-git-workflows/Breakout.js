import React from "react"

const Breakout = ({ children }) => (
  <div
    css={{
      width: `98vw`,
      position: `relative`,
      left: `50%`,
      right: `50%`,
      marginLeft: `-49vw`,
      marginRight: `-49vw`,
      display: `grid`,
      placeContent: `center`,
    }}
  >
    {children}
  </div>
)

export default Breakout
