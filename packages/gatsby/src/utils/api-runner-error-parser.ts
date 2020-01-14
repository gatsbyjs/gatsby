interface IMatch {
  id: string
  context: {
    message: string
    [key: string]: string
  }
  error?: Error | undefined
  [key: string]: unknown
}

const errorParser = ({ err }): IMatch => {
  const handlers = [
    {
      regex: /(.+) is not defined/m,
      cb: (match): IMatch => {
        return {
          id: `11330`,
          context: { message: match[0], arg: match[1] },
        }
      },
    },
    // Match anything with a generic catch-all error handler
    {
      regex: /[\s\S]*/gm,
      cb: (match): IMatch => {
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
    const matched = err.message?.match(regex)
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
