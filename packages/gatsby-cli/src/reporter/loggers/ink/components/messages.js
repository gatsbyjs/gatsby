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

const getLabel = level => {
  switch (level) {
    case `SUCCESS`:
      return createLabel(`success`, `green`)
    case `WARNING`:
      return createLabel(`warn`, `yellow`)
    case `DEBUG`:
      return createLabel(`verbose`, `gray`)
    case `INFO`:
      return createLabel(`info`, `blue`)
    default:
      return createLabel(`debug ${level}`, `blue`)
  }
}

export const Message = ({ level, hideColors, children }) => {
  if (!level || level === `LOG`) {
    return <>{children}</>
  }

  const TextLabel = getLabel(level)

  return (
    <Box textWrap="wrap" flexDirection="row">
      <TextLabel hideColors={hideColors} />
      {` `}
      {children}
    </Box>
  )
}
