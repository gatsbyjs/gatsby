import * as React from "react"

const Grid = ({ children, columns, ...rest }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: Array(columns || children.length)
        .fill("1fr")
        .join(" "),
      gridGap: "2rem",
    }}
    {...rest}
  >
    {children}
  </div>
)

export default Grid
