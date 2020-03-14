import { IMatch } from "../types"
import { SourceLocation } from "graphql"

interface IErrorParser {
  message: string
  filePath: string | undefined
  location:
    | {
        start: SourceLocation
        end?: SourceLocation
      }
    | undefined
}

const errorParser = ({
  message,
  filePath = undefined,
  location = undefined,
}: IErrorParser): IMatch => {
  // Handle GraphQL errors. A list of regexes to match certain
  // errors to specific callbacks
  const handlers = [
    {
      regex: /Variable "(.+)" of required type "(.+)" was not provided\./m,
      cb: (match): IMatch => {
        return {
          id: `85920`,
          context: {
            sourceMessage: match[0],
            variableName: match[1],
            variableType: match[2],
          },
        }
      },
    },
    {
      regex: /Variable "(.+)" of type "(.+)" used in position expecting type "(.+)"\./m,
      cb: (match): IMatch => {
        return {
          id: `85921`,
          context: {
            sourceMessage: match[0],
            variableName: match[1],
            inputType: match[2],
            expectedType: match[3],
          },
        }
      },
    },
    {
      regex: /Field "(.+)" must not have a selection since type "(.+)" has no subfields\./m,
      cb: (match): IMatch => {
        return {
          id: `85922`,
          context: {
            sourceMessage: match[0],
            fieldName: match[1],
            fieldType: match[2],
          },
        }
      },
    },
    {
      regex: /Cannot query field "(.+)" on type "(.+)"\./m,
      cb: (match): IMatch => {
        return {
          id: `85923`,
          context: {
            sourceMessage: match[0],
            field: match[1],
            type: match[2],
          },
        }
      },
    },
    {
      regex: /(.+) cannot represent (.+) value: "(.+)"/m,
      cb: (match): IMatch => {
        return {
          id: `85924`,
          context: {
            sourceMessage: match[0],
            type: match[1],
            desc: match[2],
            value: match[3],
          },
        }
      },
    },
    {
      regex: /Cannot return null for non-nullable field (.+)/m,
      cb: (match): IMatch => {
        return {
          id: `85925`,
          context: {
            sourceMessage: match[0],
            field: match[1],
          },
        }
      },
    },
    {
      regex: /Must provide Source\. Received: (.+)/m,
      cb: (match): IMatch => {
        return {
          id: `85926`,
          context: {
            sourceMessage: match[0],
            received: match[1],
          },
        }
      },
    },
    {
      regex: /Variable "(.+)" is never used in operation "(.+)".*/ms,
      cb: (match): IMatch => {
        return {
          id: `85927`,
          context: {
            sourceMessage: match[0],
            variable: match[1],
            operation: match[2],
          },
        }
      },
    },
    // Match anything with a generic catch-all error handler
    {
      regex: /[\s\S]*/gm,
      cb: (match): IMatch => {
        return {
          id: `85901`,
          context: { sourceMessage: match[0] },
        }
      },
    },
  ]

  let structured

  for (const { regex, cb } of handlers) {
    const matched = message?.match(regex)
    if (matched) {
      structured = {
        ...cb(matched),
        ...{ location },
        ...{ filePath },
      }
      break
    }
  }

  return structured
}

export default errorParser

interface ILocOfGraphQLDocInSrcFile {
  start: SourceLocation
  end: SourceLocation
  fileName: boolean
}

export const locInGraphQlToLocInFile = (
  locationOfGraphQLDocInSourceFile: ILocOfGraphQLDocInSrcFile,
  graphqlLocation: SourceLocation
): SourceLocation => {
  return {
    line:
      graphqlLocation.line + locationOfGraphQLDocInSourceFile.start.line - 1,
    column:
      (graphqlLocation.line === 1
        ? locationOfGraphQLDocInSourceFile.start.column
        : 0) + graphqlLocation.column,
  }
}
