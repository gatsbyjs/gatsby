import { memo, type JSX, type ComponentType } from "react"
import path from "path"
import { Box, Text } from "ink"
import type { IStructuredError } from "../../../../structured-errors/types"

type IFileProps = {
  filePath: string
  location: IStructuredError["location"]
}

function _File({ filePath, location }: IFileProps): JSX.Element {
  const lineNumber = location?.start.line

  let locString = ``
  if (typeof lineNumber !== `undefined`) {
    locString += `:${lineNumber}`
    const columnNumber = location?.start.column
    if (typeof columnNumber !== `undefined`) {
      locString += `:${columnNumber}`
    }
  }

  return (
    <Text color="blue">
      {path.relative(process.cwd(), filePath)}
      {locString}
    </Text>
  )
}

const File: ComponentType<IFileProps> = memo<IFileProps>(_File)

type IDocsLinkProps = {
  docsUrl: string | undefined
}

function _DocsLink({ docsUrl }: IDocsLinkProps): JSX.Element | null {
  // TODO: when there's no specific docsUrl, add helpful message describing how
  // to submit an issue
  if (docsUrl === `https://gatsby.dev/issue-how-to`) {
    return null
  }

  return (
    <Box marginTop={1}>
      <Text>See our docs page for more info on this error: {docsUrl}</Text>
    </Box>
  )
}

const DocsLink: ComponentType<IDocsLinkProps> = memo<IDocsLinkProps>(_DocsLink)

export type IErrorProps = {
  details: IStructuredError
}

function _Error({ details }: IErrorProps): JSX.Element {
  return (
    // const stackLength = get(details, `stack.length`, 0
    <Box marginY={1} flexDirection="column">
      <Box flexDirection="column">
        <Box flexDirection="column">
          <Box>
            <Box marginRight={1}>
              <Text color="black" backgroundColor="red">
                {` ${details.level} `}
                {details.code ? `#${details.code} ` : ``}
              </Text>
              <Text color="red">{details.type ? ` ` + details.type : ``}</Text>
            </Box>
          </Box>
          <Box marginTop={1}>
            <Text>{details.text}</Text>
          </Box>
          {details.filePath && (
            <Box marginTop={1}>
              <Text>File:{` `}</Text>
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
}

export const Error: ComponentType<IErrorProps> = memo<IErrorProps>(_Error)
