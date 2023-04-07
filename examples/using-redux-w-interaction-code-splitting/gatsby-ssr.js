import * as React from "react"
import WrapRootElement from "./src/redux/reduxWrapper"

export const wrapRootElement = ({ element }) => (
  <WrapRootElement element={element} />
)
