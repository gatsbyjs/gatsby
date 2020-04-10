const errorParser = ({ err }) => {
  const handlers = [
    {
      regex: /(.+) is not defined/m,
      cb: match => {
        return {
          id: `11330`,
          context: { message: match[0], arg: match[1] },
        }
      },
    },
    // Match anything with a generic catch-all error handler
    {
      regex: /[\s\S]*/gm,
      cb: match => {
        return {
          id: `11321`,
          context: { message: err instanceof Error ? match[0] : err },
          error: err instanceof Error ? err : undefined,
        }
      },
    },
  ]

  let structured

  for (const { regex, cb } of handlers) {
    if (Array.isArray(err)) {
      err = err[0]
    }
    if (err.message) {
      err = err.message
    }
    const matched = err?.match(regex)
    if (matched) {
      structured = {
        ...cb(matched),
      }
      break
    }
  }

  return structured
}

export default errorParser
