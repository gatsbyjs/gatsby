import React from "react"
import Portal from "./portal"

export function Indicator() {
  return (
    <Portal>
      <div
        style={{
          position: `fixed`,
          bottom: `1em`,
          left: `1em`,
          border: `2px solid rebeccapurple`,
        }}
      >
        Loading ...
      </div>
    </Portal>
  )
}
