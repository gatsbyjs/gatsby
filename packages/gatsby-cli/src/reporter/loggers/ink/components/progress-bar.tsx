import React from "react"
import { Box, Text } from "ink"
import { calcElapsedTime } from "../../../../util/calc-elapsed-time"

const maxWidth = 30
const minWidth = 10

const getLength = (prop: string | number): number => String(prop).length

export interface IProgressbarProps {
  message: string
  current: number
  total: number
  startTime: [number, number]
}

export function ProgressBar({
  message,
  current,
  total,
  startTime,
}: IProgressbarProps): JSX.Element {
  const percentage = total ? Math.round((current / total) * 100) : 0
  const terminalWidth = process.stdout.columns || 80
  const availableWidth =
    terminalWidth -
    getLength(message) -
    getLength(current) -
    getLength(total) -
    getLength(percentage) -
    11 // margins + extra characters

  const progressBarWidth = Math.max(
    minWidth,
    Math.min(maxWidth, availableWidth)
  )

  return (
    <Box flexDirection="row">
      <Box marginRight={3} width={progressBarWidth}>
        <Text>[</Text>
        <Box width={progressBarWidth - 2}>
          <Text>{`=`.repeat(((progressBarWidth - 2) * percentage) / 100)}</Text>
        </Box>
        <Text>]</Text>
      </Box>
      <Box marginRight={1}>
        <Text>{calcElapsedTime(startTime)} s</Text>
      </Box>
      <Box marginRight={1}>
        <Text>
          {current}/{total}
        </Text>
      </Box>
      <Box marginRight={1}>
        <Text>{`` + percentage}%</Text>
      </Box>
      <Box>
        <Text wrap="truncate">{message}</Text>
      </Box>
    </Box>
  )
}
