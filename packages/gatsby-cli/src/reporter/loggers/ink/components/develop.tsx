import React, { useContext, useState, useEffect } from "react"
import { Box, Color, StdoutContext } from "ink"
import StoreStateContext from "../context"

// Track the width and height of the terminal. Responsive app design baby!
const useTerminalResize = (): Array<number> => {
  const { stdout } = useContext(StdoutContext)
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
  status: string
}

const Develop: React.FC<IDevelopProps> = ({ pagesCount, appName, status }) => {
  const [width] = useTerminalResize()

  return (
    <Box flexDirection="column" marginTop={2}>
      <Box textWrap={`truncate`}>{`—`.repeat(width)}</Box>
      <Box height={1} flexDirection="row">
        <Color>{pagesCount} pages</Color>
        <Box flexGrow={1} />
        <Color>{status}</Color>
        <Box flexGrow={1} />
        <Color>{appName}</Color>
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
