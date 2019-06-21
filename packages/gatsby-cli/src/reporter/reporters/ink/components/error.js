import React from "react"
import path from "path"
import { Color, Box } from "ink"
import { get } from "lodash"

const File = ({ filePath, location }) => {
  const lineNumber = get(location, `start.line`)

  let locString = ``
  if (lineNumber) {
    locString += `:${lineNumber}`
    const columnNumber = get(location, `start.column`)
    if (columnNumber) {
      locString += `:${columnNumber}`
    }
  }

  return (
    <Color blue>
      {path.relative(process.cwd(), filePath)}
      {locString}
    </Color>
  )
}

const Error = ({ details }) => {
  const origError = get(details, `error.message`, null)
  // const stackLength = get(details, `stack.length`, 0)

  return (
    <Box marginY={1} flexDirection="column">
      <Box flexDirection="column">
        <Box flexDirection="column">
          <Box>
            <Box marginRight={1}>
              <Color black bgRed>
                {` ${details.level} `}
                {details.id ? `#${details.id} ` : ``}
              </Color>
              <Color red>{details.type ? ` ` + details.type : ``}</Color>
            </Box>
            {origError}
          </Box>
          <Box marginTop={1}>{details.text}</Box>
          {details.filePath && (
            <Box marginTop={1}>
              File:{` `}
              <File filePath={details.filePath} location={details.location} />
            </Box>
          )}
        </Box>
        {details.docsUrl && (
          <Box marginTop={1}>
            See our docs page for more info on this error: {details.docsUrl}
          </Box>
        )}
      </Box>
      {/* TODO: use this to replace errorFormatter.render in reporter.error func
      {stackLength > 0 && (
        <Box>
          <Color>
            <Box flexDirection="column">
              <Box>Error stack:</Box>
              {details.stack.map((item, id) => (
                <Box key={id}>
                  {item.fileName && `${item.fileName} line ${item.lineNumber}`}
                </Box>
              ))}
            </Box>
          </Color>
        </Box>
      )} */}
    </Box>
  )
}

export default Error
