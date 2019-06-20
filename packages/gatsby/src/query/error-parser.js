const errorParser = ({ message, filePath }) => {
  // Handle specific errors from Relay. A list of regexes to match certain
  // errors to specific callbacks
  const handlers = [
    {
      regex: /Encountered\s\d\serror.*:\n(.*)/gm,
      cb: match => {
        return {
          id: `85907`,
          filePath,
          context: { message: match[1] },
        }
      },
    },
    // Match anything with a generic catch-all error handler
    {
      regex: /[\s\S]*/gm,
      cb: match => {
        return {
          id: `85901`,
          filePath,
          context: { sourceMessage: match[0] },
        }
      },
    },
  ]

  let structured

  for (const { regex, cb } of handlers) {
    let matched = message.match(regex)
    if (matched) {
      structured = cb(matched)
      break
    }
  }

  return structured
}

export default errorParser
