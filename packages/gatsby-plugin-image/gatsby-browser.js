import React from "react"
import { LaterHydrator } from "."

export function wrapRootElement({ element }) {
  return <LaterHydrator>{element}</LaterHydrator>
}
