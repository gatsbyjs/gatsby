import * as React from "react"

const Grid = ({ children, columns, ...rest }) => {
  const wrappedChildren = React.Children.map(children, child => (
    <div style={{ maxWidth: 280, width: "100%" }}>{child}</div>
  ))

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
      }}
      {...rest}
    >
      {wrappedChildren}
    </div>
  )
}

export default Grid
