import { type ComponentType, memo, type JSX } from "react"
import { Box, Text } from "ink"
import { createLabel } from "./utils"

import { ActivityLogLevels, LogLevels } from "../../../constants"

function getLabel(
  level: ActivityLogLevels | LogLevels,
): ReturnType<typeof createLabel> {
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

export type IMessageProps = {
  level: ActivityLogLevels | LogLevels
  text: string
  duration?: number | undefined
  statusText?: string | undefined
}

function _Message({
  level,
  text,
  duration,
  statusText,
}: IMessageProps): JSX.Element {
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

export const Message: ComponentType<IMessageProps> =
  memo<IMessageProps>(_Message)
