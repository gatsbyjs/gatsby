import React from "react"
import { Box } from "ink"
import InkSpinner from "ink-spinner"

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
      <InkSpinner type="dots" /> {label}
    </Box>
  )
}
