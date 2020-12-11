import React from "react"
import { Box, Text } from "ink"
import * as InkSpinner from "ink-spinner"

interface ISpinnerProps {
  text: string
  statusText?: string
}
export function Spinner({ text, statusText }: ISpinnerProps): JSX.Element {
  let label = text
  if (statusText) {
    label += ` — ${statusText}`
  }

  return (
    <Box>
      <Text>
        <InkSpinner.default type="dots" /> {label}
      </Text>
    </Box>
  )
}
