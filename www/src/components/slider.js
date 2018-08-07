import React from "react"
import "./slider.css"

export default ({ items, color }) => (
  <div className="slidingVertical">
    {items.map(item => (
      <span key={item} css={{ color }}>
        {item}
      </span>
    ))}
  </div>
)
