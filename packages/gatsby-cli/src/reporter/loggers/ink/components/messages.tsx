import * as React  from "react"
import { Box, Color, ColorProps } from "ink"

import { ActivityLogLevels, LogLevels } from "../../../constants"

{/* <Color {...props}>{text}</Color> */}

interface LabelProps {
  text: string
  color: 'green' | 'yellow' | 'gray' | 'blue' | 'red'
  colorProps?: ColorProps
}

function Label({ text, color, colorProps }: LabelProps): JSX.Element {
  const memoColor = React.useMemo(function factory() {
    return { [color]: true }
  }, [color])

  return (
    <Color {...colorProps} {...memoColor} >{text}</Color>
    // <ColorSwitcher {...{ [color]: true, ...props }} text={text} />
  )
}

interface TextLabelProps {
  level: ActivityLogLevels | LogLevels
}

function TextLabel({ level }: TextLabelProps): JSX.Element {
  switch (level) {
    case ActivityLogLevels.Success:
    case LogLevels.Success:
      return <Label text={`success`} color={`green`} />
    case LogLevels.Warning:
      return <Label text={`warn`} color={`yellow`} />
    case LogLevels.Debug:
      return <Label text={`verbose`} color={`gray`} />
    case LogLevels.Info:
      return <Label text={`info`} color={`blue`} />
    case ActivityLogLevels.Failed:
      return <Label text={`failed`} color={`red`} />
    case ActivityLogLevels.Interrupted:
      return <Label text={`not finished`} color={`gray`} />

    default:
      return <Label text={level} color={`blue`} />
  }
}

interface Props {
  level: ActivityLogLevels | LogLevels
  text: string
  duration: number
  statusText: string
}

function Message({ level, text, duration, statusText }: Props): JSX.Element {
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

  return (
    <Box textWrap="wrap" flexDirection="row">
      <TextLabel level={level}/>
      {` `}
      {message}
    </Box>
  )
}

export default React.memo(Message)
