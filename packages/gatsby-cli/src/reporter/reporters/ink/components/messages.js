import React from "react"
import { Box, Color } from "ink"
import stripAnsi from "strip-ansi"

const ColorSwitcher = ({ hideColors, children, ...props }) => {
  if (hideColors) {
    return stripAnsi(children)
  }

  return <Color {...props}>{children}</Color>
}

const createLabel = (text, color) => (...props) => (
  <ColorSwitcher {...{ [color]: true, ...props }}>{text}</ColorSwitcher>
)

const getLabel = type => {
  switch (type) {
    case `success`:
      return createLabel(`success`, `green`)
    case `error`:
      return createLabel(`error`, `red`)
    case `warn`:
      return createLabel(`warn`, `yellow`)
    case `verbose`:
      return createLabel(`verbose`, `gray`)
    case `info`:
      return createLabel(`info`, `blue`)
    default:
      return createLabel(`debug ${type}`, `blue`)
  }
}

export const Message = ({ type, hideColors, children }) => {
  if (!type) {
    return <>{children}</>
  }

  const TextLabel = getLabel(type)

  return (
    <Box textWrap="wrap" flexDirection="row">
      <TextLabel hideColors={hideColors} />
      {` `}
      {children}
    </Box>
  )
}
