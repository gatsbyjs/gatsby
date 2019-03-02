import React from "react"
import presets from "../utils/presets"

const Cards = props => {
  return (
    <div
      className={props.className}
      css={{
        display: `flex`,
        flex: `0 1 auto`,
        flexWrap: `wrap`,
        background: `#fff`,
        borderRadius: presets.radiusLg,
        boxShadow: `0 5px 20px rgba(25, 17, 34, 0.1)`,
        transform: `translateZ(0)`,
        width: `100%`,
      }}
    >
      {props.children}
    </div>
  )
}

export default Cards
