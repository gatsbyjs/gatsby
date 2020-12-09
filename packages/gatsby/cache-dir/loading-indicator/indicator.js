import React from "react"
import Portal from "./portal"
import Style from "./style"

export function Indicator() {
  return (
    <Portal>
      <Style />
      <div data-gatsby-loading-indicator="root">
        <div data-gatsby-loading-indicator="spinner" aria-hidden={true} />
        <div data-gatsby-loading-indicator="text">Loading</div>
      </div>
    </Portal>
  )
}
