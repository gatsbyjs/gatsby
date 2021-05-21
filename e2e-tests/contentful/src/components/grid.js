import * as React from "react"

const Grid = ({ children, columns, ...rest }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, 240px)",
      gridGap: "2rem",
    }}
    {...rest}
  >
    {children}
  </div>
)

export default Grid
