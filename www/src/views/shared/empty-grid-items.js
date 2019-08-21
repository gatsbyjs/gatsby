import React from "react"

const EmptyGridItems = ({ styles }) => {
  let items = []

  for (let i = 0; i < 6; i++) {
    items.push(
      <div
        key={`empty-grid-item-${i}`}
        aria-hidden="true"
        css={{
          ...styles,
          marginTop: 0,
          marginBottom: 0,
        }}
      />
    )
  }

  return <>{items}</>
}

export default EmptyGridItems
