import React from "react"

const isChildOfType = (child, Component) => child.type === <Component />.type
export default isChildOfType
