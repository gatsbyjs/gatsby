import React from "react"
import Header from "./header"

export default ({ children, ...props }) => (
  <root>
    <Header {...props} />
    <div>
      <div>{children}</div>
    </div>
  </root>
)
