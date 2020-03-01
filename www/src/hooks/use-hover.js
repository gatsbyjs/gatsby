import React from "react"

export default function useHover() {
  const [isHovered, setHovered] = React.useState(false)

  const onMouseEnter = React.useCallback(() => setHovered(true), [])
  const onMouseLeave = React.useCallback(() => setHovered(false), [])

  return [isHovered, { onMouseEnter, onMouseLeave }]
}
