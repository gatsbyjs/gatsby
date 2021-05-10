import React from "react"
import { Box, Text } from "ink"
import { createLabel } from "./utils"

import { ActivityLogLevels, LogLevels } from "../../../constants"

const getLabel = (
  level: ActivityLogLevels | LogLevels
): ReturnType<typeof createLabel> => {
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

export interface IMessageProps {
  level: ActivityLogLevels | LogLevels
  text: string
  duration?: number
  statusText?: string
}

export const Message = React.memo<IMessageProps>(
  ({ level, text, duration, statusText }) => {
    let message = text
    if (duration) {
      message += ` - ${duration.toFixed(3)}s`
    }
    if (statusText) {
      message += ` - ${statusText}`
    }
    if (!level || level === `LOG`) {
      return <Text>{message}</Text>
    }

    const TextLabel = getLabel(level)

    return (
      <Box flexDirection="row">
        <Text wrap="wrap">
          <TextLabel />
          {` `}
          {message}
        </Text>
      </Box>
    )
  }
)
