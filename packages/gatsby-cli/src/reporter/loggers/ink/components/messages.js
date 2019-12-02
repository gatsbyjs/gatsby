import React from "react"
import { Box, Color } from "ink"

import { ActivityLogLevels, LogLevels } from "../../../constants"

const ColorSwitcher = ({ children, ...props }) => (
  <Color {...props}>{children}</Color>
)

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

export const Message = ({ level, text, duration, statusText }) => {
  let message = ``
  if (duration) {
    // Anticipate hundreds of seconds (300s = 5min) but ignore >999s
    message += `- ${duration.toFixed(3).padStart(10, ` `)}s - `
  }
  message += text
  if (statusText) {
    message += ` - ${statusText}`
  }
  if (!level || level === `LOG`) {
    return <>{message}</>
  }

  const TextLabel = getLabel(level)

  return (
    <Box textWrap="wrap" flexDirection="row">
      <TextLabel />
      {` `}
      {message}
    </Box>
  )
}
