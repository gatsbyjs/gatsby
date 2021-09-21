import * as React from "react"

export default function CirclesOrnament ({ width = 32, height = 87, ...rest }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 87"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      {...rest}
    >
      <circle cx="17" cy="15" r="14.5" stroke="currentColor" />
      <circle cx="17" cy="35" r="14.5" stroke="currentColor" />
      <circle cx="17" cy="55" r="14.5" stroke="currentColor" />
      <circle cx="17" cy="70" r="14.5" stroke="currentColor" />
    </svg>
  )
}
