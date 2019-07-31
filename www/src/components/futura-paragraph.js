/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"

const FuturaParagraph = ({ children }) => (
  <p
    sx={{
      fontFamily: `header`,
      mb: 0,
      fontSize: 3,
    }}
  >
    {children}
  </p>
)

export default FuturaParagraph
