import React from "react"
import { Box } from "ink"
import InkSpinner from "ink-spinner"

interface IProps {
  text: string
  statusText?: string
}
export function Spinner({ text, statusText }: IProps): JSX.Element {
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
