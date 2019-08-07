import React from "react"
import convertHrtime from "convert-hrtime"
import { Box } from "ink"
import Spinner from "ink-spinner"

export const calcElapsedTime = startTime => {
  const elapsed = process.hrtime(startTime)

  return convertHrtime(elapsed)[`seconds`].toFixed(3)
}

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
