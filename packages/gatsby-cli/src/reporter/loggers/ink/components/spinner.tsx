import * as React from "react"
import { Box } from "ink"
import InkSpinner from "ink-spinner"

interface IProps {
  text: string
  statusText?: string
}

function Spinner({ text, statusText }: IProps): JSX.Element {
  const label = React.useMemo(function factory() {
    if (statusText !== undefined) {
      return text + ` — ${statusText}`
    }

    return text
  }, [text, statusText])

  return (
    <Box>
      <InkSpinner type="dots" /> {label}
    </Box>
  )
}

export default React.memo(Spinner)
