import React from "react"

const isChildOfType = function isChildOfType(child, Component) {
  return child.type === <Component />.type
}

export default isChildOfType
