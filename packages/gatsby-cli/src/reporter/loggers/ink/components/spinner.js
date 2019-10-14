import React from "react"
import { Box } from "ink"
import Spinner from "ink-spinner"

export default function Activity({ text, statusText }) {
  let label = text
  if (statusText) {
    label += ` — ${statusText}`
  }

  return (
    <Box>
      <Spinner type="dots" /> {label}
    </Box>
  )
}
