import React from "react"
import { Box, Color } from "ink"
import stripAnsi from "strip-ansi"

import { ActivityLogLevels, LogLevels } from "../../../constants"

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
    case ActivityLogLevels.Success:
    case LogLevels.Success:
      return createLabel(`success`, `green`)
    case LogLevels.Warning:
      return createLabel(`warn`, `yellow`)
    case LogLevels.Debug:
      return createLabel(`verbose`, `gray`)
    case LogLevels.Info:
      return createLabel(`info`, `blue`)
    case ActivityLogLevels.Failed:
      return createLabel(`failed`, `red`)
    case ActivityLogLevels.Interrupted:
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
