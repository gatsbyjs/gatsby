import React, { FunctionComponent } from "react"
import path from "path"
import { Color, Box } from "ink"
import { get } from "lodash"

interface IFileProps {
  filePath: string
  location: string
}
const File: FunctionComponent<IFileProps> = ({ filePath, location }) => {
  const lineNumber = get(location, `start.line`)

  let locString = ``
  if (typeof lineNumber !== `undefined`) {
    locString += `:${lineNumber}`
    const columnNumber = get(location, `start.column`)
    if (typeof columnNumber !== `undefined`) {
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

interface IDocsLinkProps {
  docsUrl: string
}
const DocsLink: FunctionComponent<IDocsLinkProps> = ({ docsUrl }) => {
  // TODO: when there's no specific docsUrl, add helpful message describing how
  // to submit an issue
  if (docsUrl === `https://gatsby.dev/issue-how-to`) return null
  return (
    <Box marginTop={1}>
      See our docs page for more info on this error: {docsUrl}
    </Box>
  )
}

interface IErrorProps {
  details: {
    level: string
    code?: string
    type?: string
    text: string
    filePath?: string
    location: string
    docsUrl: string
  }
}

export const Error: FunctionComponent<IErrorProps> = React.memo(
  ({ details }) => (
    // const stackLength = get(details, `stack.length`, 0

    <Box marginY={1} flexDirection="column">
      <Box flexDirection="column">
        <Box flexDirection="column">
          <Box>
            <Box marginRight={1}>
              <Color black bgRed>
                {` ${details.level} `}
                {details.code ? `#${details.code} ` : ``}
              </Color>
              <Color red>{details.type ? ` ` + details.type : ``}</Color>
            </Box>
          </Box>
          <Box marginTop={1}>{details.text}</Box>
          {details.filePath && (
            <Box marginTop={1}>
              File:{` `}
              <File filePath={details.filePath} location={details.location} />
            </Box>
          )}
        </Box>
        <DocsLink docsUrl={details.docsUrl} />
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
)
