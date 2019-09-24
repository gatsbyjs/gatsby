import React, { useContext, useState, useEffect } from "react"
import { Box, Color, StdoutContext } from "ink"
import { connect } from "react-redux"

// Track the width and height of the terminal. Responsive app design baby!
const useTerminalResize = () => {
  const { stdout } = useContext(StdoutContext)
  const [sizes, setSizes] = useState([stdout.columns, stdout.rows])
  useEffect(() => {
    stdout.on(`resize`, () => {
      setSizes([stdout.columns, stdout.rows])
    })
    return () => {
      stdout.off(`resize`)
    }
  }, [stdout])

  return sizes
}

const mapConstantToStatus = {
  IN_PROGRESS: `In Progress`,
  NOT_STARTED: `Not Started`,
  INTERRUPTED: `Interrupted`,
  FAILED: `Failed`,
  SUCCESS: `Success`,
  CANCELLED: `Cancelled`,
}

const Develop = ({ pagesCount, appName, status }) => {
  const [width] = useTerminalResize()

  return (
    <Box flexDirection="column" marginTop={2}>
      <Box textWrap={`truncate`}>{`—`.repeat(width)}</Box>
      <Box height={1} flexDirection="row">
        <Color>{pagesCount} pages</Color>
        <Box flexGrow={1} />
        <Color>{mapConstantToStatus[status]}</Color>
        <Box flexGrow={1} />
        <Color>{appName}</Color>
      </Box>
    </Box>
  )
}

const ConnectedDevelop = connect(state => {
  return {
    pagesCount: state.pages ? state.pages.size : 0,
    appName: state.program.sitePackageJson.name || ``,
    status: state.logs.status,
  }
})(Develop)

export default ConnectedDevelop
