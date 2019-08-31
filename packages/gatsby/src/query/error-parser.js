const errorParser = ({ message, filePath, location }) => {
  // Handle specific errors from Relay. A list of regexes to match certain
  // errors to specific callbacks
  const handlers = [
    {
      regex: /Field "(.+)" must not have a selection since type "(.+)" has no subfields/m,
      cb: match => {
        return {
          id: `85909`,
          context: {
            sourceMessage: match[0],
            fieldName: match[1],
            typeName: match[2],
          },
        }
      },
    },
    {
      regex: /Encountered\s\d\serror.*:\n\s*(.*)/m,
      cb: match => {
        return {
          id: `85907`,
          context: { message: match[1] },
        }
      },
    },
    // Warn users about a possible Windows-specific error resulting from uppercase folders:
    // "Error: RelayParser: Encountered duplicated definitions for one or more documents:
    // each document must have a unique name. Duplicated documents:"
    {
      regex: /Error: RelayParser: Encountered duplicated.*/gm,
      cb: match => {
        return {
          id: `85902`,
          context: {
            sourceMessage:
              match[0] +
              `\n\nWarning: Windows users may be able to fix this error by renaming all directories to lowercase in the file path.`,
          },
        }
      },
    },
    // Match anything with a generic catch-all error handler
    {
      regex: /[\s\S]*/gm,
      cb: match => {
        return {
          id: `85901`,
          context: { sourceMessage: match[0] },
        }
      },
    },
  ]

  let structured

  for (const { regex, cb } of handlers) {
    let matched = message.match(regex)
    if (matched) {
      structured = {
        filePath,
        location,
        ...cb(matched),
      }
      break
    }
  }

  return structured
}

export default errorParser
