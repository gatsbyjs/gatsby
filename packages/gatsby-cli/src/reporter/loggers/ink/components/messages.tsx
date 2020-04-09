import React, { FunctionComponent } from "react"
import { Box, Color, ColorProps } from "ink"

import { ActivityLogLevels, LogLevels } from "../../../constants"

const ColorSwitcher: FunctionComponent<ColorProps> = ({
  children,
  ...props
}) => <Color {...props}>{children}</Color>

const createLabel = (
  text: string,
  color: string
): FunctionComponent<ColorProps> => (...props): JSX.Element => (
  <ColorSwitcher {...{ [color]: true, ...props }}>{text}</ColorSwitcher>
)

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

interface IProps {
  level: ActivityLogLevels | LogLevels
  text: string
  duration: number
  statusText: string
}
export const Message = React.memo<IProps>(
  ({ level, text, duration, statusText }) => {
    let message = text
    if (duration) {
      message += ` - ${duration.toFixed(3)}s`
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
        <TextLabel />
        {` `}
        {message}
      </Box>
    )
  }
)
