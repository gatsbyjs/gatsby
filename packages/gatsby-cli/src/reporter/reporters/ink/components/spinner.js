import React from "react"
import { Box } from "ink"
import Spinner from "ink-spinner"

export default function Activity({ name, status }) {
  let statusText = name
  if (status) {
    statusText += ` — ${status}`
  }

  return (
    <Box>
      <Spinner type="dots" /> {statusText}
    </Box>
  )
}
