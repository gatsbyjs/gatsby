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
    case `ACTIVITY_SUCCESS`:
    case `SUCCESS`:
      return createLabel(`success`, `green`)
    case `WARNING`:
      return createLabel(`warn`, `yellow`)
    case `DEBUG`:
      return createLabel(`verbose`, `gray`)
    case `INFO`:
      return createLabel(`info`, `blue`)
    case `ACTIVITY_FAILED`:
      return createLabel(`failed`, `red`)
    case `ACTIVITY_INTERRUPTED`:
      return createLabel(`not finished`, `gray`)

    default:
      return createLabel(level, `blue`)
  }
}

export const Message = ({ level, hideColors, text, duration, statusText }) => {
  let message = text
  if (duration) {
    message += ` - ${duration}s`
  }
  if (statusText) {
    message += ` - ${statusText}`
  }
  if (!level || level === `LOG`) {
    return <>{message}</>
  }

  const TextLabel = getLabel(level)

  return (
    <Box textWrap="wrap" flexDirection="row">
      <TextLabel hideColors={hideColors} />
      {` `}
      {message}
    </Box>
  )
}
