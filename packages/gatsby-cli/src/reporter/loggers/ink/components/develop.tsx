import React, { useContext, useState, useEffect } from "react"
import { Box, Text, useStdout } from "ink"
import StoreStateContext from "../context"
import { ActivityStatuses } from "../../../constants"
import { createLabel } from "./utils"

const getLabel = (
  level: ActivityStatuses | string
): ReturnType<typeof createLabel> => {
  switch (level) {
    case ActivityStatuses.InProgress:
      return createLabel(`In Progress`, `white`)
    case ActivityStatuses.Interrupted:
      return createLabel(`Interrupted`, `gray`)
    case ActivityStatuses.Failed:
      return createLabel(`Failed`, `red`)
    case ActivityStatuses.Success:
      return createLabel(`Success`, `green`)

    default:
      return createLabel(level, `white`)
  }
}

// Track the width and height of the terminal. Responsive app design baby!
const useTerminalResize = (): Array<number> => {
  const { stdout } = useStdout()

  // stdout type is nullable, so we need to handle case where it is undefined for type checking.
  // In practice this shouldn't happen ever, because AFAIK type is only nullable
  // because Ink's StdoutContext is initiated with `undefined`:
  // https://github.com/vadimdemedes/ink/blob/83894963727cf40ccac2256ec346e5ff3381c918/src/components/StdoutContext.ts#L20-L23
  // but ContextProvider requires stdout to be set:
  // https://github.com/vadimdemedes/ink/blob/83894963727cf40ccac2256ec346e5ff3381c918/src/components/App.tsx#L18
  // https://github.com/vadimdemedes/ink/blob/83894963727cf40ccac2256ec346e5ff3381c918/src/components/App.tsx#L79-L84
  if (!stdout) {
    return [0]
  }

  const [sizes, setSizes] = useState([stdout.columns, stdout.rows])
  useEffect(() => {
    const resizeListener = (): void => {
      setSizes([stdout.columns, stdout.rows])
    }
    stdout.on(`resize`, resizeListener)
    return (): void => {
      stdout.off(`resize`, resizeListener)
    }
  }, [stdout])

  return sizes
}

interface IDevelopProps {
  pagesCount: number
  appName: string
  status: ActivityStatuses | ""
}

const Develop: React.FC<IDevelopProps> = ({ pagesCount, appName, status }) => {
  const [width] = useTerminalResize()

  const StatusLabel = getLabel(status)

  return (
    <Box flexDirection="column" marginTop={2}>
      <Box>
        <Text wrap="truncate">{`—`.repeat(width)}</Text>
      </Box>
      <Box height={1} flexDirection="row">
        <StatusLabel />
        <Box flexGrow={1} />
        <Text>{appName}</Text>
        <Box flexGrow={1} />
        <Text>{pagesCount} pages</Text>
      </Box>
    </Box>
  )
}

const ConnectedDevelop: React.FC = () => {
  const state = useContext(StoreStateContext)

  return (
    <Develop
      pagesCount={state.pages?.size || 0}
      appName={state.program?.sitePackageJson.name || ``}
      status={state.logs?.status || ``}
    />
  )
}

export default ConnectedDevelop
