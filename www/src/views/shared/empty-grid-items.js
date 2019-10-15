/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"

const EmptyGridItems = ({ styles }) => {
  let items = []

  for (let i = 0; i < 6; i++) {
    items.push(
      <div
        key={`empty-grid-item-${i}`}
        aria-hidden="true"
        sx={{
          ...styles,
          my: 0,
        }}
      />
    )
  }

  return <React.Fragment>{items}</React.Fragment>
}

export default EmptyGridItems
