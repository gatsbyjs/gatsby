import * as React from "react"

const Collapsible = ({ summary, children }) => {
  return (
    <details style={{ backgroundColor: `##f2f2f2`, padding: `2rem`, borderRadius: `10px` }}>
      <summary
        style={{ display: `list-item`, fontWeight: 600, cursor: `pointer`, ">:first-of-type": { display: `inline` } }}
      >
        {summary}
      </summary>
      {children}
    </details>
  )
}

export const components = {
  Collapsible,
}