import React from "react"
import Transition from "./src/components/transition"

export const wrapPageElement = ({ element, props }) => {
  return <Transition {...props}>{element}</Transition>
}
