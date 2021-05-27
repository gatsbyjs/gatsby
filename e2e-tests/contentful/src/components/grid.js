import * as React from "react"

const Grid = ({ children, columns, ...rest }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, 240px)",
      gridGap: "2rem",
      maxWidth: "240px",
    }}
    {...rest}
  >
    {children}
  </div>
)

export default Grid
